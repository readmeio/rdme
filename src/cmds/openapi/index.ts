import type { CommandOptions } from '../../lib/baseCommand';
import type { RequestInit, Response } from 'node-fetch';

import chalk from 'chalk';
import { Headers } from 'node-fetch';
import ora from 'ora';
import parse from 'parse-link-header';

import Command, { CommandCategories } from '../../lib/baseCommand';
import createGHA from '../../lib/createGHA';
import { oraOptions } from '../../lib/logger';
import prepareOas from '../../lib/prepareOas';
import * as promptHandler from '../../lib/prompts';
import promptTerminal from '../../lib/promptWrapper';
import readmeAPIFetch, { cleanHeaders, handleRes } from '../../lib/readmeAPIFetch';
import streamSpecToRegistry from '../../lib/streamSpecToRegistry';
import { getProjectVersion } from '../../lib/versionSelect';

export interface Options {
  create?: boolean;
  dryRun?: boolean;
  id?: string;
  raw?: boolean;
  spec?: string;
  title?: string;
  update?: boolean;
  useSpecVersion?: boolean;
  version?: string;
  workingDirectory?: string;
}

export default class OpenAPICommand extends Command {
  constructor() {
    super();

    this.command = 'openapi';
    this.usage = 'openapi [file|url] [options]';
    this.description = 'Upload, or resync, your OpenAPI/Swagger definition to ReadMe.';
    this.cmdCategory = CommandCategories.APIS;

    this.hiddenArgs = ['spec'];
    this.args = [
      this.getKeyArg(),
      {
        name: 'id',
        type: String,
        description:
          "Unique identifier for your API definition. Use this if you're re-uploading an existing API definition.",
      },
      this.getVersionArg(),
      {
        name: 'spec',
        type: String,
        defaultOption: true,
      },
      this.getWorkingDirArg(),
      {
        name: 'useSpecVersion',
        type: Boolean,
        description:
          'Uses the version listed in the `info.version` field in the API definition for the project version parameter.',
      },
      {
        name: 'raw',
        type: Boolean,
        description: 'Return the command results as a JSON object instead of a pretty output.',
      },
      this.getGitHubArg(),
      {
        name: 'create',
        type: Boolean,
        description: 'Bypasses the create/update prompt and creates a new API definition.',
      },
      {
        name: 'update',
        type: Boolean,
        description:
          "Automatically update an existing API definition in ReadMe if it's the only one associated with the current version.",
      },
      this.getTitleArg(),
      {
        name: 'dryRun',
        type: Boolean,
        description: 'Runs the command without creating/updating any API Definitions in ReadMe. Useful for debugging.',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    const { dryRun, key, id, spec, create, raw, title, useSpecVersion, version, workingDirectory, update } = opts;

    let selectedVersion = version;
    let isUpdate: boolean;
    const spinner = ora({ ...oraOptions() });
    /**
     * The `version` and `update` parameters are not typically ones we'd want to include
     * in GitHub Actions workflow files, so we're going to collect them in this object.
     */
    const ignoredGHAParameters: Options = { version: undefined, update: undefined };

    if (dryRun) {
      Command.warn('🎭 dry run option detected! No API definitions will be created or updated in ReadMe.');
    }

    if (create && update) {
      throw new Error(
        'The `--create` and `--update` options cannot be used simultaneously. Please use one or the other!',
      );
    }

    if (workingDirectory) {
      const previousWorkingDirectory = process.cwd();
      process.chdir(workingDirectory);
      Command.debug(`switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
    }

    if (version && id) {
      Command.warn(
        "We'll be using the version associated with the `--id` option, so the `--version` option will be ignored.",
      );
    }

    if (create && id) {
      Command.warn("We'll be using the `--create` option, so the `--id` parameter will be ignored.");
    }

    if (update && id) {
      Command.warn(
        "We'll be updating the API definition associated with the `--id` parameter, so the `--update` parameter will be ignored.",
      );
    }

    // Reason we're hardcoding in command here is because `swagger` command
    // relies on this and we don't want to use `swagger` in this function
    const { preparedSpec, specFileType, specPath, specType, specVersion } = await prepareOas(spec, 'openapi', {
      title,
    });

    if (useSpecVersion) {
      Command.info(
        `Using the version specified in your API definition for your ReadMe project version (${specVersion})`,
      );
      selectedVersion = specVersion;
    }

    if (create || !id) {
      selectedVersion = await getProjectVersion(selectedVersion, key);
    }

    Command.debug(`selectedVersion: ${selectedVersion}`);

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

      return Promise.resolve(raw ? JSON.stringify(output, null, 2) : prettyOutput).then(msg =>
        createGHA(msg, this.command, this.args, {
          ...opts,
          spec: specPath,
          // eslint-disable-next-line no-underscore-dangle
          id: body._id,
          version: selectedVersion,
          ...ignoredGHAParameters,
        }),
      );
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
        new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-readme-version': selectedVersion,
        }),
      ),
      body: JSON.stringify({ registryUUID }),
    };

    function createSpec() {
      if (dryRun) {
        return `🎭 dry run! The API Definition located at ${specPath} will be created for this project version: ${selectedVersion}`;
      }

      options.method = 'post';
      spinner.start('Creating your API docs in ReadMe...');
      return readmeAPIFetch('/api/v1/api-specification', options, {
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
      return readmeAPIFetch(`/api/v1/api-specification/${specId}`, options, {
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
      return readmeAPIFetch(url, {
        method: 'get',
        headers: cleanHeaders(
          key,
          new Headers({
            'x-readme-version': selectedVersion,
          }),
        ),
      });
    }

    if (create) {
      ignoredGHAParameters.id = undefined;
      delete ignoredGHAParameters.version;
      return createSpec();
    }

    if (!id) {
      Command.debug('no id parameter, retrieving list of API specs');
      const apiSettings = await getSpecs('/api/v1/api-specification');

      const totalPages = Math.ceil(parseInt(apiSettings.headers.get('x-total-count'), 10) / 10);
      const parsedDocs = parse(apiSettings.headers.get('link'));
      Command.debug(`total pages: ${totalPages}`);
      Command.debug(`pagination result: ${JSON.stringify(parsedDocs)}`);

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

      // @todo: figure out how to add a stricter type here, see:
      // https://github.com/readmeio/rdme/pull/570#discussion_r949715913
      const { option } = await promptTerminal(
        promptHandler.createOasPrompt(apiSettingsBody, parsedDocs, totalPages, getSpecs),
      );
      Command.debug(`selection result: ${option}`);

      return option === 'create' ? createSpec() : updateSpec(option);
    }

    /*
        Update an existing OAS file in Readme:
          - Enter flow if user passes an id as cli arg
      */
    return updateSpec(id);
  }
}
