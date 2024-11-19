import type { OpenAPIPromptOptions } from '../../lib/prompts.js';

import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import parse from 'parse-link-header';

import BaseCommand from '../../lib/baseCommand.js';
import { githubFlag, keyFlag, titleFlag, versionFlag, workingDirectoryFlag } from '../../lib/flags.js';
import { info, oraOptions, warn } from '../../lib/logger.js';
import prepareOas from '../../lib/prepareOas.js';
import * as promptHandler from '../../lib/prompts.js';
import promptTerminal from '../../lib/promptWrapper.js';
import { cleanHeaders, handleRes, readmeAPIV1Fetch } from '../../lib/readmeAPIFetch.js';
import streamSpecToRegistry from '../../lib/streamSpecToRegistry.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

export default class OpenAPICommand extends BaseCommand<typeof OpenAPICommand> {
  static description = 'Upload, or resync, your OpenAPI/Swagger definition to ReadMe.';

  // needed for unit tests, even though we also specify this in src/index.ts
  static id = 'openapi';

  static args = {
    spec: Args.string({ description: 'A file/URL to your API definition' }),
  };

  static flags = {
    key: keyFlag,
    version: versionFlag,
    id: Flags.string({
      description:
        "Unique identifier for your API definition. Use this if you're re-uploading an existing API definition.",
    }),
    title: titleFlag,
    workingDirectory: workingDirectoryFlag,
    github: githubFlag,
    dryRun: Flags.boolean({
      description: 'Runs the command without creating/updating any API Definitions in ReadMe. Useful for debugging.',
    }),
    useSpecVersion: Flags.boolean({
      description:
        'Uses the version listed in the `info.version` field in the API definition for the project version parameter.',
    }),
    raw: Flags.boolean({ description: 'Return the command results as a JSON object instead of a pretty output.' }),
    create: Flags.boolean({
      description: 'Bypasses the create/update prompt and creates a new API definition in ReadMe.',
      exclusive: ['update'], // this prevents `--create` and `--update` from being used simultaneously
    }),
    update: Flags.boolean({
      description:
        "Bypasses the create/update prompt and automatically updates an existing API definition in ReadMe. Note that this flag only works if there's only one API definition associated with the current version.",
      summary: 'Bypasses the create/update prompt and automatically updates an existing API definition in ReadMe.',
    }),
  };

  async run() {
    const { spec } = this.args;
    const { dryRun, key, id, create, raw, title, useSpecVersion, version, workingDirectory, update } = this.flags;

    let selectedVersion = version;
    let isUpdate: boolean;
    const spinner = ora({ ...oraOptions() });
    /**
     * The `version` and `update` parameters are not typically ones we'd want to include
     * in GitHub Actions workflow files, so we're going to collect them in this object.
     */
    const ignoredGHAParameters: Partial<typeof this.flags> = { version: undefined, update: false };

    if (dryRun) {
      warn('🎭 dry run option detected! No API definitions will be created or updated in ReadMe.');
    }

    if (workingDirectory) {
      const previousWorkingDirectory = process.cwd();
      process.chdir(workingDirectory);
      this.debug(`switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
    }

    if (version && id) {
      warn("We'll be using the version associated with the `--id` option, so the `--version` option will be ignored.");
    }

    if (create && id) {
      warn("We'll be using the `--create` option, so the `--id` parameter will be ignored.");
    }

    if (update && id) {
      warn(
        "We'll be updating the API definition associated with the `--id` parameter, so the `--update` parameter will be ignored.",
      );
    }

    const { preparedSpec, specFileType, specPath, specType, specVersion } = await prepareOas(spec, 'openapi', {
      title,
    });

    if (useSpecVersion) {
      info(`Using the version specified in your API definition for your ReadMe project version (${specVersion})`);
      selectedVersion = specVersion;
    }

    if (create || !id) {
      selectedVersion = await getProjectVersion(selectedVersion, key);
    }

    this.debug(`selectedVersion: ${selectedVersion}`);

    const success = async (data: Response) => {
      const message = !isUpdate
        ? `You've successfully uploaded a new ${specType} file to your ReadMe project!`
        : `You've successfully updated an existing ${specType} file on your ReadMe project!`;

      const body = await handleRes(data, false);

      const output = {
        commandType: isUpdate ? 'update' : 'create',
        docs: data.headers.get('location'),
        // eslint-disable-next-line no-underscore-dangle
        id: body._id,
        specPath,
        specType,
        version: selectedVersion,
      };

      const prettyOutput = [
        message,
        '',
        `\t${chalk.green(output.docs)}`,
        '',
        `To update your ${specType} definition, run the following:`,
        '',
        `\t${chalk.green(`rdme openapi ${specPath} --key=<key> --id=${output.id}`)}`,
      ].join('\n');

      return this.runCreateGHAHook({
        parsedOpts: {
          ...this.flags,
          spec: specPath,
          // eslint-disable-next-line no-underscore-dangle
          id: body._id,
          version: selectedVersion,
          ...ignoredGHAParameters,
        },
        result: raw ? JSON.stringify(output, null, 2) : prettyOutput,
      });
    };

    const error = (res: Response) => {
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
            "We're sorry, your upload request timed out. Please try again or split your file up into smaller chunks.",
          );
        }

        // As a fallback, we throw a more generic error.
        throw new Error(
          `Yikes, something went wrong! Please try uploading your spec again and if the problem persists, get in touch with our support team at ${chalk.underline(
            'support@readme.io',
          )}.`,
        );
      });
    };

    const registryUUID = await streamSpecToRegistry(preparedSpec);

    const options: RequestInit = {
      headers: cleanHeaders(
        key,
        selectedVersion,
        new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' }),
      ),
      body: JSON.stringify({ registryUUID }),
    };

    function createSpec() {
      if (dryRun) {
        return `🎭 dry run! The API Definition located at ${specPath} will be created for this project version: ${selectedVersion}`;
      }

      options.method = 'post';
      spinner.start('Creating your API docs in ReadMe...');
      return readmeAPIV1Fetch('/api/v1/api-specification', options, {
        filePath: specPath,
        fileType: specFileType,
      }).then(res => {
        if (res.ok) {
          spinner.succeed(`${spinner.text} done! 🦉`);
          return success(res);
        }
        spinner.fail();
        return error(res);
      });
    }

    function updateSpec(specId: string) {
      if (dryRun) {
        return `🎭 dry run! The API Definition located at ${specPath} will update this API Definition ID: ${specId}`;
      }

      isUpdate = true;
      options.method = 'put';
      spinner.start('Updating your API docs in ReadMe...');
      return readmeAPIV1Fetch(`/api/v1/api-specification/${specId}`, options, {
        filePath: specPath,
        fileType: specFileType,
      }).then(res => {
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
      if (url) {
        return readmeAPIV1Fetch(url, {
          method: 'get',
          headers: cleanHeaders(key, selectedVersion),
        });
      }

      throw new Error(
        'There was an error retrieving your list of API definitions. Please get in touch with us at support@readme.io',
      );
    }

    if (create) {
      ignoredGHAParameters.id = undefined;
      delete ignoredGHAParameters.version;
      return createSpec();
    }

    if (!id) {
      this.debug('no id parameter, retrieving list of API specs');
      const apiSettings = await getSpecs('/api/v1/api-specification');

      const totalPages = Math.ceil(parseInt(apiSettings.headers.get('x-total-count') || '0', 10) / 10);
      const parsedDocs = parse(apiSettings.headers.get('link'));
      this.debug(`total pages: ${totalPages}`);
      this.debug(`pagination result: ${JSON.stringify(parsedDocs)}`);

      const apiSettingsBody = await handleRes(apiSettings);
      if (!apiSettingsBody.length) return createSpec();

      if (update) {
        if (apiSettingsBody.length > 1) {
          throw new Error(
            `The \`--update\` option cannot be used when there's more than one API definition available (found ${apiSettingsBody.length}).`,
          );
        }
        const { _id: specId } = apiSettingsBody[0];
        return updateSpec(specId);
      }

      const { option }: { option: OpenAPIPromptOptions } = await promptTerminal(
        promptHandler.createOasPrompt(apiSettingsBody, parsedDocs, totalPages, getSpecs),
      );
      this.debug(`selection result: ${option}`);

      return option === 'create' ? createSpec() : updateSpec(option);
    }

    /*
        Update an existing OAS file in Readme:
          - Enter flow if user passes an id as cli arg
      */
    return updateSpec(id);
  }
}
