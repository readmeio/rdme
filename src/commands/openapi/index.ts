import type { OpenAPIPromptOptions } from '../../lib/prompts.js';

import { Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import parse from 'parse-link-header';

import BaseCommand from '../../lib/baseCommand.js';
import { githubFlag, keyFlag, specArg, titleFlag, versionFlag, workingDirectoryFlag } from '../../lib/flags.js';
import { info, oraOptions, warn } from '../../lib/logger.js';
import prepareOas from '../../lib/prepareOas.js';
import * as promptHandler from '../../lib/prompts.js';
import promptTerminal from '../../lib/promptWrapper.js';
import { cleanAPIv1Headers, handleAPIv1Res, readmeAPIv1Fetch } from '../../lib/readmeAPIFetch.js';
import streamSpecToRegistry from '../../lib/streamSpecToRegistry.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

export default class OpenAPICommand extends BaseCommand<typeof OpenAPICommand> {
  static summary = 'Upload, or resync, your OpenAPI/Swagger definition to ReadMe.';

  static description =
    "Locates your API definition (if you don't supply one), validates it, and then syncs it to your API reference on ReadMe.";

  // needed for unit tests, even though we also specify this in src/index.ts
  static id = 'openapi' as const;

  static state = 'deprecated';

  static deprecationOptions = {
    message: `\`rdme ${this.id}\` is deprecated and v10 will have a replacement command that supports ReadMe Refactored.\n\nFor more information, please visit our migration guide: https://github.com/readmeio/rdme/blob/v10/documentation/migration-guide.md#migrating-to-rdme9`,
  };

  static args = {
    spec: specArg,
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
        "Note that this flag only works if there's only one API definition associated with the current version.",
      summary: 'Bypasses the create/update prompt and automatically updates an existing API definition in ReadMe.',
    }),
  };

  static examples = [
    {
      description:
        'This will upload the API definition at the given URL or path to your project and return an ID and URL for you to later update your file, and view it in the client:',
      command: '<%= config.bin %> <%= command.id %> [url-or-local-path-to-file]',
    },
    {
      description:
        'You can omit the file name and `rdme` will scan your working directory (and any subdirectories) for OpenAPI/Swagger files. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.',
      command: '<%= config.bin %> <%= command.id %>',
    },
    {
      description:
        'If you want to bypass the prompt to create or update an API definition, you can pass the `--create` flag:',
      command: '<%= config.bin %> <%= command.id %> [url-or-local-path-to-file] --version={project-version} --create',
    },
    {
      description:
        'This will edit (re-sync) an existing API definition (identified by `--id`) within your ReadMe project. **This is the recommended approach for usage in CI environments.**',
      command: '<%= config.bin %> <%= command.id %> [url-or-local-path-to-file] --id={existing-api-definition-id}',
    },
    {
      description:
        "Alternatively, you can include a version flag, which specifies the target version for your file's destination. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.",
      command: '<%= config.bin %> <%= command.id %> [url-or-local-path-to-file] --id={existing-api-definition-id}',
    },
    {
      description:
        "If you wish to programmatically access any of this script's results (such as the API definition ID or the link to the corresponding docs in your dashboard), supply the `--raw` flag and the command will return a JSON output:",
      command: '<%= config.bin %> <%= command.id %> openapi.json --id={existing-api-definition-id} --raw',
    },
    {
      description:
        'You can also pass in a file in a subdirectory (we recommend running the CLI from the root of your repository if possible):',
      command: '<%= config.bin %> <%= command.id %> example-directory/petstore.json',
    },
    {
      description:
        'By default, `<%= config.bin %>` bundles all references with paths based on the directory that it is being run in. You can override the working directory using the `--workingDirectory` option, which can be helpful for bundling certain external references:',
      command: '<%= config.bin %> <%= command.id %> petstore.json --workingDirectory=[path to directory]',
    },
    {
      description:
        'If you wish to use the version specified in the `info.version` field of your OpenAPI definition, you can pass the `--useSpecVersion` option. So if the the `info.version` field was `1.2.3`, this is equivalent to passing `--version=1.2.3`.',
      command: '<%= config.bin %> <%= command.id %> [url-or-local-path-to-file] --useSpecVersion',
    },
    {
      description:
        "If there's only one API definition for the given project version to update, you can use the `--update` flag and it will select it without any prompts:",
      command: '<%= config.bin %> <%= command.id %> [url-or-local-path-to-file] --version={project-version} --update',
    },
  ];

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

      const body = await handleAPIv1Res(data, false);

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
      return handleAPIv1Res(res).catch(err => {
        // If we receive an APIv1Error, no changes needed! Throw it as is.
        if (err.name === 'APIv1Error') {
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
      headers: cleanAPIv1Headers(
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
      return readmeAPIv1Fetch('/api/v1/api-specification', options, {
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
      return readmeAPIv1Fetch(`/api/v1/api-specification/${specId}`, options, {
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
        return readmeAPIv1Fetch(url, {
          method: 'get',
          headers: cleanAPIv1Headers(key, selectedVersion),
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

      const apiSettingsBody = await handleAPIv1Res(apiSettings);
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
