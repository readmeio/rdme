const APIError = require('../lib/apiError');
const chalk = require('chalk');
const { cleanHeaders } = require('../lib/fetch');
const config = require('config');
const fs = require('fs');
const { debug, oraOptions } = require('../lib/logger');
const fetch = require('../lib/fetch');
const { handleRes } = require('../lib/fetch');
const { getProjectVersion } = require('../lib/versionSelect');
const ora = require('ora');
const parse = require('parse-link-header');
const prepareOas = require('../lib/prepareOas');
const { prompt } = require('enquirer');
const promptOpts = require('../lib/prompts');
const streamSpecToRegistry = require('../lib/streamSpecToRegistry');

module.exports = class OpenAPICommand {
  constructor() {
    this.command = 'openapi';
    this.usage = 'openapi [file] [options]';
    this.description = 'Upload, or resync, your OpenAPI/Swagger definition to ReadMe.';
    this.cmdCategory = 'apis';
    this.position = 1;

    this.hiddenArgs = ['token', 'spec'];
    this.args = [
      {
        name: 'key',
        type: String,
        description: 'Project API key',
      },
      {
        name: 'id',
        type: String,
        description:
          "Unique identifier for your API definition. Use this if you're re-uploading an existing API definition",
      },
      {
        name: 'version',
        type: String,
        description: 'Project version',
      },
      {
        name: 'spec',
        type: String,
        defaultOption: true,
      },
      {
        name: 'workingDirectory',
        type: String,
        description: 'Working directory (for usage with relative external references)',
      },
    ];
  }

  async run(opts) {
    const { key, id, spec, version, workingDirectory } = opts;
    let selectedVersion;
    let isUpdate;
    const spinner = ora({ ...oraOptions() });

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (workingDirectory) {
      process.chdir(workingDirectory);
    }

    if (version && id) {
      console.warn(
        chalk.yellow(
          `⚠️  Warning! We'll be using the version associated with the \`--${
            opts.token ? 'token' : 'id'
          }\` option, so the \`--version\` option will be ignored.`
        )
      );
    }

    debug(`key (final): ${key}`);
    debug(`id (final): ${id}`);

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    async function callApi(specPath, versionCleaned) {
      const { bundledSpec, specType } = await prepareOas(specPath, true);

      async function success(data) {
        const message = !isUpdate
          ? `You've successfully uploaded a new ${specType} file to your ReadMe project!`
          : `You've successfully updated an existing ${specType} file on your ReadMe project!`;

        debug(`successful ${data.status} response`);
        const body = await data.json();
        debug(`successful response payload: ${JSON.stringify(body)}`);

        return Promise.resolve(
          [
            message,
            '',
            `\t${chalk.green(`${data.headers.get('location')}`)}`,
            '',
            `To update your ${specType} definition, run the following:`,
            '',
            // eslint-disable-next-line no-underscore-dangle
            `\t${chalk.green(`rdme openapi ${specPath} --key=<key> --id=${body._id}`)}`,
          ].join('\n')
        );
      }

      async function error(res) {
        return handleRes(res).catch(err => {
          // If we receive an APIError, no changes needed! Throw it as is.
          if (err instanceof APIError) {
            throw err;
          }
          // If we receive certain text responses, it's likely a 5xx error from our server.
          if (
            typeof err === 'string' &&
            (err.includes('<title>Application Error</title>') || // Heroku error
              err.includes('520: Web server is returning an unknown error</title>')) // Cloudflare error
          ) {
            throw new Error(
              "We're sorry, your upload request timed out. Please try again or split your file up into smaller chunks."
            );
          }
          // As a fallback, we throw a more generic error.
          throw new Error(
            `Yikes, something went wrong! Please try uploading your spec again and if the problem persists, get in touch with our support team at ${chalk.underline(
              'support@readme.io'
            )}.`
          );
        });
      }

      const registryUUID = await streamSpecToRegistry(bundledSpec);

      const options = {
        headers: cleanHeaders(key, {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-readme-version': versionCleaned,
        }),
        body: JSON.stringify({ registryUUID }),
      };

      function createSpec() {
        options.method = 'post';
        spinner.start('Creating your API docs in ReadMe...');
        return fetch(`${config.get('host')}/api/v1/api-specification`, options).then(res => {
          if (res.ok) {
            spinner.succeed(`${spinner.text} done! 🦉`);
            return success(res);
          }
          spinner.fail();
          return error(res);
        });
      }

      function updateSpec(specId) {
        isUpdate = true;
        options.method = 'put';
        spinner.start('Updating your API docs in ReadMe...');
        return fetch(`${config.get('host')}/api/v1/api-specification/${specId}`, options).then(res => {
          if (res.ok) {
            spinner.succeed(`${spinner.text} done! 🦉`);
            return success(res);
          }
          spinner.fail();
          return error(res);
        });
      }

      /*
        Create a new OAS file in Readme:
          - Enter flow if user does not pass an id as cli arg
          - Check to see if any existing files exist with a specific version
          - If none exist, default to creating a new instance of a spec
          - If found, prompt user to either create a new spec or update an existing one
      */

      function getSpecs(url) {
        return fetch(`${config.get('host')}${url}`, {
          method: 'get',
          headers: cleanHeaders(key, {
            'x-readme-version': versionCleaned,
          }),
        });
      }

      if (!id) {
        debug('no id parameter, retrieving list of API specs');
        const apiSettings = await getSpecs('/api/v1/api-specification');

        const totalPages = Math.ceil(apiSettings.headers.get('x-total-count') / 10);
        const parsedDocs = parse(apiSettings.headers.get('link'));
        debug(`total pages: ${totalPages}`);
        debug(`pagination result: ${JSON.stringify(parsedDocs)}`);

        const apiSettingsBody = await apiSettings.json();
        debug(`api settings list response payload: ${JSON.stringify(apiSettingsBody)}`);
        if (!apiSettingsBody.length) return createSpec();

        const { option } = await prompt(promptOpts.createOasPrompt(apiSettingsBody, parsedDocs, totalPages, getSpecs));
        debug(`selection result: ${option}`);
        if (!option) return null;
        return option === 'create' ? createSpec() : updateSpec(option);
      }

      /*
        Update an existing OAS file in Readme:
          - Enter flow if user passes an id as cli arg
      */
      return updateSpec(id);
    }

    if (!id) {
      selectedVersion = await getProjectVersion(version, key, true);
    }

    debug(`selectedVersion: ${selectedVersion}`);

    if (spec) {
      return callApi(spec, selectedVersion);
    }

    // If the user didn't supply an API specification, let's try to locate what they've got, and upload
    // that. If they don't have any, let's let the user know how they can get one going.
    return new Promise((resolve, reject) => {
      ['swagger.json', 'swagger.yaml', 'swagger.yml', 'openapi.json', 'openapi.yaml', 'openapi.yml'].forEach(file => {
        debug(`looking for definition with filename: ${file}`);
        if (!fs.existsSync(file)) {
          debug(`${file} not found`);
          return;
        }

        console.info(chalk.yellow(`We found ${file} and are attempting to upload it.`));
        resolve(callApi(file, selectedVersion));
      });

      reject(
        new Error(
          "We couldn't find an OpenAPI or Swagger definition.\n\n" +
            'Please specify the path to your definition with `rdme openapi ./path/to/api/definition`.'
        )
      );
    });
  }
};
