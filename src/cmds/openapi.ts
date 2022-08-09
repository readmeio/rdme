import type { CommandOptions } from '../lib/baseCommand';
import type { RequestInit, Response } from 'node-fetch';

import chalk from 'chalk';
import config from 'config';
import { prompt } from 'enquirer';
import { Headers } from 'node-fetch';
import ora from 'ora';
import parse from 'parse-link-header';

import versionOpt from 'lib/versionOpt';

import Command, { CommandCategories } from '../lib/baseCommand';
import fetch, { cleanHeaders, handleRes } from '../lib/fetch';
import { debug, info, warn, oraOptions } from '../lib/logger';
import prepareOas from '../lib/prepareOas';
import * as promptHandler from '../lib/prompts';
import streamSpecToRegistry from '../lib/streamSpecToRegistry';
import { getProjectVersion } from '../lib/versionSelect';

export type Options = {
  id?: string;
  spec?: string;
  version?: string;
  useSpecVersion?: boolean;
  workingDirectory?: string;
};

export default class OpenAPICommand extends Command {
  constructor() {
    super();

    this.command = 'openapi';
    this.usage = 'openapi [file] [options]';
    this.description = 'Upload, or resync, your OpenAPI/Swagger definition to ReadMe.';
    this.cmdCategory = CommandCategories.APIS;
    this.position = 1;

    this.hiddenArgs = ['spec'];
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
          "Unique identifier for your API definition. Use this if you're re-uploading an existing API definition.",
      },
      versionOpt,
      {
        name: 'spec',
        type: String,
        defaultOption: true,
      },
      {
        name: 'useSpecVersion',
        type: Boolean,
        description:
          'Uses the version listed in the `info.version` field in the API definition for the project version parameter.',
      },
      {
        name: 'workingDirectory',
        type: String,
        description: 'Working directory (for usage with relative external references)',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    super.run(opts);

    const { key, id, spec, useSpecVersion, version, workingDirectory } = opts;

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    let selectedVersion: string;
    let isUpdate: boolean;
    const spinner = ora({ ...oraOptions() });

    if (workingDirectory) {
      process.chdir(workingDirectory);
    }

    if (version && id) {
      warn("We'll be using the version associated with the `--id` option, so the `--version` option will be ignored.");
    }

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    // Reason we're hardcoding in command here is because `swagger` command
    // relies on this and we don't want to use `swagger` in this function
    const { bundledSpec, specPath, specType, specVersion } = await prepareOas(spec, 'openapi');

    if (useSpecVersion) {
      info(`Using the version specified in your API definition for your ReadMe project version (${specVersion})`);
      selectedVersion = specVersion;
    }

    if (!id) {
      selectedVersion = await getProjectVersion(selectedVersion, key, true);
    }

    debug(`selectedVersion: ${selectedVersion}`);

    async function success(data: Response) {
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

    async function error(res: Response) {
      return handleRes(res).catch(err => {
        // If we receive an APIError, no changes needed! Throw it as is.
        if (err.name === 'APIError') {
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

    const options: RequestInit = {
      headers: cleanHeaders(
        key,
        new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-readme-version': selectedVersion,
        })
      ),
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

    function updateSpec(specId: string) {
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

    function getSpecs(url: string) {
      return fetch(`${config.get('host')}${url}`, {
        method: 'get',
        headers: cleanHeaders(
          key,
          new Headers({
            'x-readme-version': selectedVersion,
          })
        ),
      });
    }

    if (!id) {
      debug('no id parameter, retrieving list of API specs');
      const apiSettings = await getSpecs('/api/v1/api-specification');

      const totalPages = Math.ceil(parseInt(apiSettings.headers.get('x-total-count'), 10) / 10);
      const parsedDocs = parse(apiSettings.headers.get('link'));
      debug(`total pages: ${totalPages}`);
      debug(`pagination result: ${JSON.stringify(parsedDocs)}`);

      const apiSettingsBody = await apiSettings.json();
      debug(`api settings list response payload: ${JSON.stringify(apiSettingsBody)}`);
      if (!apiSettingsBody.length) return createSpec();

      const { option }: { option: 'create' | 'update' } = await prompt(
        promptHandler.createOasPrompt(apiSettingsBody, parsedDocs, totalPages, getSpecs)
      );

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
}
