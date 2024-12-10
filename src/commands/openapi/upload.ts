import fs from 'node:fs';
import nodePath from 'node:path';

import { Args, Flags } from '@oclif/core';
import ora from 'ora';
import prompts from 'prompts';
import slugify from 'slugify';
import { file as tmpFile } from 'tmp-promise';

import BaseCommand from '../../lib/baseCommand.js';
import { keyFlag } from '../../lib/flags.js';
import isCI, { isTest } from '../../lib/isCI.js';
import { oraOptions } from '../../lib/logger.js';
import prepareOas from '../../lib/prepareOas.js';
import promptTerminal from '../../lib/promptWrapper.js';

export default class OpenAPIBetaCommand extends BaseCommand<typeof OpenAPIBetaCommand> {
  static args = {
    spec: Args.string({
      summary: 'A file/URL to your API definition',
      description:
        'If your working directory and all subdirectories contain a single OpenAPI file, you can omit the file name.',
    }),
  };

  static description = 'the new openapi command yayay';

  static flags = {
    key: keyFlag,
    uri: Flags.string({
      summary: 'The URI for your API definition.',
      description: 'If not provided, the URI will be inferred from the file name and path.',
    }),
    action: Flags.string({
      description: 'The action you want to take. Recommended in CI to prevent accidental overwrites.',
      default: 'upsert',
      options: ['create', 'update', 'upsert'],
    }),
    useSpecVersion: Flags.boolean({
      summary: 'Use the version specified in your API definition',
      description:
        'If included, use the version specified in the `info.version field in your OpenAPI definition. This is mutually exclusive with `--version`.',
      exactlyOne: ['version', 'useSpecVersion'],
    }),
    version: Flags.string({
      summary: 'ReadMe project version',
      description: 'This is mutually exclusive with `--useSpecVersion`.',
    }),
  };

  static examples = [
    {
      description: 'You can pass in a file name like so:',
      command: '<%= config.bin %> <%= command.id %> --version=1.0.0 openapi.json',
    },
    {
      description:
        'If your working directory and all subdirectories contain a single OpenAPI file, you can omit the file name:',
      command: '<%= config.bin %> <%= command.id %> --version=1.0.0',
    },
    {
      description:
        'You can also pass in a file in a subdirectory (we recommend always running the CLI from the root of your repository):',
      command: '<%= config.bin %> <%= command.id %> --version=v1.0.0 example-directory/petstore.json',
    },
    {
      description: 'You can also pass in a URL:',
      command: '<%= config.bin %> <%= command.id %> --version=1.0.0 https://example.com/openapi.json',
    },
    {
      description:
        'If you specify your ReadMe project version in the `info.version` field in your OpenAPI definition, you can use that:',
      command: '<%= config.bin %> <%= command.id %> --useSpecVersion https://example.com/openapi.json',
    },
  ];

  /**
   * Poll the ReadMe API until the upload is complete.
   */
  private async pollAPIUntilUploadIsComplete(uri: string, headers: Headers) {
    let count = 0;
    let status = 'pending';

    while (status === 'pending' && count < 10) {
      // eslint-disable-next-line no-await-in-loop, no-loop-func
      await new Promise(resolve => {
        // exponential backoff — wait 1s, 2s, 4s, 8s, 16s, 32s, 30s, 30s, 30s, 30s, etc.
        setTimeout(resolve, Math.min(isTest() ? 1 : 1000 * 2 ** count, 30000));
      });
      this.debug(`polling API for status of ${uri}, count is ${count}`);
      // eslint-disable-next-line no-await-in-loop
      const response = await this.readmeAPIFetch(uri, { headers }).then(res => this.handleAPIRes(res));
      status = response?.data?.upload?.status;
      count += 1;
    }

    if (status === 'pending') {
      throw new Error('Sorry, this upload timed out. Please try again later.');
    }

    return status;
  }

  async run() {
    const { spec } = this.args;

    const { preparedSpec, specFileType, specPath, specVersion } = await prepareOas(spec, 'openapi');

    const version = this.flags.useSpecVersion ? specVersion : this.flags.version;

    const filename = this.flags.uri || specFileType === 'url' ? nodePath.basename(specPath) : slugify.default(specPath);

    const headers = new Headers({ authorization: `Bearer ${this.flags.key}` });

    const existingAPIDefinitions = await this.readmeAPIFetch(`/versions/${version}/apis`, { headers }).then(res =>
      this.handleAPIRes(res),
    );

    // if the current uri already exists, we'll use PUT to update it. otherwise, we'll use POST to create it
    const method = existingAPIDefinitions?.data?.some((d: { filename: string }) => d.filename === filename)
      ? 'PUT'
      : 'POST';

    this.debug(`making a ${method} request`);

    // if the file already exists, ask the user if they want to overwrite it
    if (method === 'PUT') {
      // bypass the prompt if we're in a CI environment
      prompts.override({
        confirm: isCI() ? true : undefined,
      });

      const { confirm } = await promptTerminal({
        type: 'confirm',
        name: 'confirm',
        message: `This will overwrite the existing API definition for ${filename}. Are you sure you want to continue?`,
      });

      if (!confirm) {
        throw new Error('Aborting, no changes were made.');
      }
    }

    const body = new FormData();

    if (specFileType === 'url') {
      this.debug('attaching URL to form data payload');
      body.append('url', specPath);
    } else {
      // Create a temporary file to write the bundled spec to,
      // which we will then stream into the form data body
      const { path } = await tmpFile({ prefix: 'rdme-openapi-', postfix: '.json' });
      this.debug(`creating temporary file at ${path}`);
      fs.writeFileSync(path, preparedSpec);
      const stream = fs.createReadStream(path);

      this.debug('file and stream created, streaming into form data payload');
      body.append('schema', {
        [Symbol.toStringTag]: 'File',
        name: filename,
        stream: () => stream,
        type: 'application/json',
      });
    }

    const options: RequestInit = { headers, method, body };

    const spinner = ora({ ...oraOptions() }).start(
      `${method === 'POST' ? 'Creating' : 'Updating'} your API definition to ReadMe...`,
    );

    const response = await this.readmeAPIFetch(
      `/versions/${version}/apis${method === 'POST' ? '' : `/${filename}`}`,
      options,
    )
      .then(res => this.handleAPIRes(res))
      .catch((err: Error) => {
        spinner.fail();
        throw err;
      });

    if (response?.data?.upload?.status && response?.data?.uri) {
      let status = response.data.upload.status;

      if (status === 'done') {
        spinner.succeed(`${spinner.text} done!`);
        this.log(
          `🚀 Your API definition (${filename}) was successfully ${method === 'POST' ? 'created' : 'updated'} in ReadMe!`,
        );
        return { uri: response.data.uri, status };
      }

      if (status === 'pending') {
        spinner.text = `${spinner.text} uploaded but not yet processed by ReadMe. Polling for completion...`;
        status = await this.pollAPIUntilUploadIsComplete(response.data.uri, headers);
        if (status === 'done') {
          spinner.succeed(`${spinner.text} done!`);
          this.log(
            `🚀 Your API definition (${filename}) was successfully ${method === 'POST' ? 'created' : 'updated'} in ReadMe!`,
          );
          return { uri: response.data.uri, status };
        }
      }
    }

    spinner.fail();
    throw new Error(
      'Your API definition upload failed with an unexpected error. Please get in touch with us at support@readme.io.',
    );
  }
}
