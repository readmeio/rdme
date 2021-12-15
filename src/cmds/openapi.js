const chalk = require('chalk');
const fs = require('fs');
const config = require('config');
const { prompt } = require('enquirer');
const OASNormalize = require('oas-normalize');
const promptOpts = require('../lib/prompts');
const APIError = require('../lib/apiError');
const { cleanHeaders } = require('../lib/cleanHeaders');
const { getProjectVersion } = require('../lib/versionSelect');
const fetch = require('node-fetch');
const FormData = require('form-data');
const parse = require('parse-link-header');
const { file: tmpFile } = require('tmp-promise');

exports.command = 'openapi';
exports.usage = 'openapi [file] [options]';
exports.description = 'Upload, or resync, your OpenAPI/Swagger definition to ReadMe.';
exports.category = 'apis';
exports.position = 1;

exports.hiddenArgs = ['token', 'spec'];
exports.args = [
  {
    name: 'key',
    type: String,
    description: 'Project API key',
  },
  {
    name: 'id',
    type: String,
    description: `Unique identifier for your API definition. Use this if you're resyncing an existing API definition`,
  },
  {
    name: 'token',
    type: String,
    description: 'Project token. Deprecated, please use `--key` instead',
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
];

exports.run = async function (opts) {
  const { spec, version } = opts;
  let { key, id } = opts;
  let selectedVersion;
  let isUpdate;

  if (!key && opts.token) {
    console.warn('Warning: `--token` has been deprecated. Please use `--key` and `--id` instead.');

    [key, id] = opts.token.split('-');
  }

  if (version && id) {
    console.warn('Warning: `--version` parameter is ignored because `--id` parameter is');
  }

  if (!key) {
    return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
  }

  async function callApi(specPath, versionCleaned) {
    // @todo Tailor messaging to what is actually being handled here. If the user is uploading a Swagger file, never mention that they uploaded/updated an OpenAPI file.

    async function success(data) {
      const message = !isUpdate
        ? "You've successfully uploaded a new OpenAPI file to your ReadMe project!"
        : "You've successfully updated an OpenAPI file on your ReadMe project!";

      const body = await data.json();

      console.log(
        [
          message,
          '',
          `\t${chalk.green(`${data.headers.get('location')}`)}`,
          '',
          'To update your OpenAPI or Swagger definition, run the following:',
          '',
          // eslint-disable-next-line no-underscore-dangle
          `\t${chalk.green(`rdme openapi FILE --key=${key} --id=${body._id}`)}`,
        ].join('\n')
      );
    }

    async function error(err) {
      try {
        const parsedError = await err.json();
        return Promise.reject(new APIError(parsedError));
      } catch (e) {
        if (e.message.includes('Unexpected token < in JSON')) {
          return Promise.reject(
            new Error(
              "We're sorry, your upload request timed out. Please try again or split your file up into smaller chunks."
            )
          );
        }

        return Promise.reject(new Error('There was an error uploading!'));
      }
    }

    let bundledSpec;
    const oas = new OASNormalize(specPath, { colorizeErrors: true, enablePaths: true });
    await oas.validate(false).catch(err => {
      return Promise.reject(err);
    });
    await oas
      .bundle()
      .then(res => {
        bundledSpec = JSON.stringify(res);
      })
      .catch(err => {
        return Promise.reject(err);
      });

    // Create a temporary file to write the bundled spec to,
    // which we will then stream into the form data body
    const { path } = await tmpFile({ prefix: 'rdme-openapi-', postfix: '.json' });
    await fs.writeFileSync(path, bundledSpec);
    const stream = fs.createReadStream(path);

    const formData = new FormData();
    formData.append('spec', stream);

    const options = {
      headers: cleanHeaders(key, {
        'x-readme-version': versionCleaned,
        'x-readme-source': 'cli',
        Accept: 'application/json',
      }),
      body: formData,
    };

    function createSpec() {
      options.method = 'post';
      return fetch(`${config.host}/api/v1/api-specification`, options)
        .then(res => {
          if (res.ok) return success(res);
          return error(res);
        })
        .catch(err => console.log(chalk.red(`\n ${err.message}\n`)));
    }

    function updateSpec(specId) {
      isUpdate = true;
      options.method = 'put';
      return fetch(`${config.host}/api/v1/api-specification/${specId}`, options)
        .then(res => {
          if (res.ok) return success(res);
          return error(res);
        })
        .catch(err => console.log(chalk.red(`\n ${err.message}\n`)));
    }

    /*
      Create a new OAS file in Readme:
        - Enter flow if user does not pass an id as cli arg
        - Check to see if any existing files exist with a specific version
        - If none exist, default to creating a new instance of a spec
        - If found, prompt user to either create a new spec or update an existing one
    */

    function getSpecs(url) {
      return fetch(`${config.host}${url}`, {
        method: 'get',
        headers: cleanHeaders(key, {
          'x-readme-version': versionCleaned,
        }),
      });
    }

    if (!id) {
      const apiSettings = await getSpecs(`/api/v1/api-specification`);

      const totalPages = Math.ceil(apiSettings.headers.get('x-total-count') / 10);
      const parsedDocs = parse(apiSettings.headers.get('link'));

      const apiSettingsBody = await apiSettings.json();
      if (!apiSettingsBody.length) return createSpec();

      const { option } = await prompt(promptOpts.createOasPrompt(apiSettingsBody, parsedDocs, totalPages, getSpecs));
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
    selectedVersion = await getProjectVersion(version, key, true).catch(e => {
      return Promise.reject(e);
    });
  }

  if (spec) {
    return callApi(spec, selectedVersion);
  }

  // If the user didn't supply an API specification, let's try to locate what they've got, and upload
  // that. If they don't have any, let's let the user know how they can get one going.
  return new Promise((resolve, reject) => {
    ['swagger.json', 'swagger.yaml', 'openapi.json', 'openapi.yaml'].forEach(file => {
      if (!fs.existsSync(file)) {
        return;
      }

      console.log(chalk.yellow(`We found ${file} and are attempting to upload it.`));
      resolve(callApi(file, selectedVersion));
    });

    reject(
      new Error(
        "We couldn't find an OpenAPI or Swagger definition.\n\n" +
          'Run `rdme openapi ./path/to/api/definition` to upload an existing definition or `rdme oas init` to create a fresh one!'
      )
    );
  });
};
