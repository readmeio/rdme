import fs from 'node:fs';
import nodePath from 'node:path';

import { Flags } from '@oclif/core';
import yaml from 'js-yaml';
import ora from 'ora';
import prompts from 'prompts';
import slugify from 'slugify';
import { file as tmpFile } from 'tmp-promise';

import BaseCommand from '../../lib/baseCommand.js';
import { keyFlag, specArg } from '../../lib/flags.js';
import isCI, { isTest } from '../../lib/isCI.js';
import { oraOptions } from '../../lib/logger.js';
import prepareOas from '../../lib/prepareOas.js';
import promptTerminal from '../../lib/promptWrapper.js';

export default class OpenAPIUploadCommand extends BaseCommand<typeof OpenAPIUploadCommand> {
  static summary = 'Upload (or re-upload) your API definition to ReadMe.';

  static description = [
    'By default, the slug (i.e., the unique identifier for your API definition resource in ReadMe) will be inferred from the spec name and path. As long as you maintain these directory/file names and run `rdme` from the same location relative to your file, the inferred slug will be preserved and any updates you make to this file will be synced to the same resource in ReadMe.',
    'If the spec is a local file, the inferred slug takes the relative path and slugifies it (e.g., the slug for `docs/api/petstore.json` will be `docs-api-petstore.json`).',
    'If the spec is a URL, the inferred slug is the base file name from the URL (e.g., the slug for `https://example.com/docs/petstore.json` will be `petstore.json`).',
  ].join('\n\n');

  static args = {
    spec: specArg,
  };

  static flags = {
    key: keyFlag,
    slug: Flags.string({
      summary: 'Override the slug (i.e., the unique identifier) for your API definition.',
      description: [
        "Allows you to override the slug (i.e., the unique identifier for your API definition resource in ReadMe) that's inferred from the API definition's file/URL path.",
        "You do not need to include a file extension (i.e., either `custom-slug.json` or `custom-slug` will work). If you do, it must match the file extension of the file you're uploading.",
      ].join('\n\n'),
    }),
    useSpecVersion: Flags.boolean({
      summary: 'Use the OpenAPI `info.version` field for your ReadMe project version',
      description:
        'If included, use the version specified in the `info.version` field in your OpenAPI definition for your ReadMe project version. This flag is mutually exclusive with `--version`.',
      exclusive: ['version'],
    }),
    version: Flags.string({
      summary: 'ReadMe project version',
      description:
        'Defaults to `stable` (i.e., your main project version). This flag is mutually exclusive with `--useSpecVersion`.',
      default: 'stable',
    }),
  };

  static examples = [
    {
      description: 'You can pass in a file name like so:',
      command: '<%= config.bin %> <%= command.id %> --version=1.0.0 openapi.json',
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
  private async pollAPIUntilUploadIsComplete(slug: string, headers: Headers) {
    let count = 0;
    let status = 'pending';

    while (status === 'pending' && count < 10) {
      // eslint-disable-next-line no-await-in-loop, no-loop-func
      await new Promise(resolve => {
        // exponential backoff — wait 1s, 2s, 4s, 8s, 16s, 32s, 30s, 30s, 30s, 30s, etc.
        setTimeout(resolve, Math.min(isTest() ? 1 : 1000 * 2 ** count, 30000));
      });
      this.debug(`polling API for status of ${slug}, count is ${count}`);
      // eslint-disable-next-line no-await-in-loop
      const response = await this.readmeAPIFetch(slug, { headers }).then(res => this.handleAPIRes(res));
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

    const { preparedSpec, specFileType, specPath, specVersion } = await prepareOas(spec, 'openapi upload');

    const version = this.flags.useSpecVersion ? specVersion : this.flags.version;

    let filename = specFileType === 'url' ? nodePath.basename(specPath) : slugify.default(specPath);

    const fileExtension = nodePath.extname(filename);
    if (this.flags.slug) {
      const slugExtension = nodePath.extname(this.flags.slug);
      if (slugExtension && (!['.json', '.yaml', '.yml'].includes(slugExtension) || fileExtension !== slugExtension)) {
        throw new Error(
          'Please provide a valid file extension that matches the extension on the file you provided. Must be `.json`, `.yaml`, or `.yml`.',
        );
      }

      // the API expects a file extension, so keep it if it's there, add it if it's not
      filename = `${this.flags.slug.replace(slugExtension, '')}${fileExtension}`;
    }

    const headers = new Headers({ authorization: `Bearer ${this.flags.key}` });

    const existingAPIDefinitions = await this.readmeAPIFetch(`/versions/${version}/apis`, { headers }).then(res =>
      this.handleAPIRes(res),
    );

    // if the current slug already exists, we'll use PUT to update it. otherwise, we'll use POST to create it
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
      const isYaml = fileExtension === '.yaml' || fileExtension === '.yml';
      // Convert YAML files back to YAML before uploading
      let specToUpload = preparedSpec;
      if (isYaml) {
        specToUpload = yaml.dump(JSON.parse(preparedSpec));
      }
      // Create a temporary file to write the bundled spec to,
      // which we will then stream into the form data body
      const { path } = await tmpFile({ prefix: 'rdme-openapi-', postfix: fileExtension });
      this.debug(`creating temporary file at ${path}`);
      fs.writeFileSync(path, specToUpload);
      const stream = fs.createReadStream(path);

      this.debug('file and stream created, streaming into form data payload');
      body.append('schema', {
        [Symbol.toStringTag]: 'File',
        name: filename,
        stream: () => stream,
        type: isYaml ? 'application/x-yaml' : 'application/json',
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

      if (status === 'pending') {
        spinner.text = `${spinner.text} uploaded but not yet processed by ReadMe. Polling for completion...`;
        status = await this.pollAPIUntilUploadIsComplete(response.data.uri, headers);
      }

      if (status === 'done') {
        spinner.succeed(`${spinner.text} done!`);
        this.log(
          `🚀 Your API definition (${filename}) was successfully ${method === 'POST' ? 'created' : 'updated'} in ReadMe!`,
        );
        return { uri: response.data.uri, status };
      }
    }

    spinner.fail();
    throw new Error(
      'Your API definition upload failed with an unexpected error. Please get in touch with us at support@readme.io.',
    );
  }
}
