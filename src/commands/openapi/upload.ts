import type {
  APIDefinitionsRepresentation,
  APIUploadSingleResponseRepresentation,
  APIUploadStatus,
  StagedAPIUploadResponseRepresentation,
} from '../../lib/types/index.js';

import nodePath from 'node:path';

import { Flags } from '@oclif/core';
import yaml from 'js-yaml';
import ora from 'ora';
import prompts from 'prompts';
import slugify from 'slugify';

import BaseCommand from '../../lib/baseCommand.js';
import { branchFlag, keyFlag, specArg, titleFlag } from '../../lib/flags.js';
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
    "For the best and most explicit results, we recommend using the `--slug` flag to set a slug for your API definition, especially if you're managing many API definitions at scale.",
  ].join('\n\n');

  static args = {
    spec: specArg,
  };

  static flags = {
    key: keyFlag,
    ...branchFlag(['This flag is mutually exclusive with `--useSpecVersion`.']),
    'confirm-overwrite': Flags.boolean({
      description:
        'If set, file overwrites will be made without a confirmation prompt. This flag can be a useful in automated environments where prompts cannot be responded to.',
      hidden: true,
    }),
    'legacy-id': Flags.string({
      summary: 'The legacy ID for your API definition.',
      description:
        'This is only used for legacy `rdme` CLI workflows and only applies if your project, and this API definition, predate ReadMe Refactored. This flag is considered deprecated and we recommend using `--slug` instead.',
      hidden: true,
      exclusive: ['slug'],
    }),
    slug: Flags.string({
      summary: 'Override the slug (i.e., the unique identifier) for your API definition.',
      description: [
        "Allows you to override the slug (i.e., the unique identifier for your API definition resource in ReadMe) that's inferred from the API definition's file/URL path.",
        "You do not need to include a file extension (i.e., either `custom-slug.json` or `custom-slug` will work). If you do, it must match the file extension of the file you're uploading.",
      ].join('\n\n'),
    }),
    title: titleFlag,
    useSpecVersion: Flags.boolean({
      summary: 'Use the OpenAPI `info.version` field for your ReadMe project version',
      description:
        'If included, use the version specified in the `info.version` field in your OpenAPI definition for your ReadMe project version. This flag is mutually exclusive with `--branch`.',
      exclusive: ['branch'],
    }),
  };

  static examples = [
    {
      description: 'You can pass in a file name like so:',
      command: '<%= config.bin %> <%= command.id %> --branch=1.0.0 openapi.json',
    },
    {
      description:
        'You can also pass in a file in a subdirectory (we recommend always running the CLI from the root of your repository):',
      command: '<%= config.bin %> <%= command.id %> --branch=v1.0.0 example-directory/petstore.json',
    },
    {
      description: 'You can also pass in a URL:',
      command: '<%= config.bin %> <%= command.id %> --branch=1.0.0 https://example.com/openapi.json',
    },
    {
      description:
        'If you specify your ReadMe project version in the `info.version` field in your OpenAPI definition, you can use that:',
      command: '<%= config.bin %> <%= command.id %> --useSpecVersion https://example.com/openapi.json',
    },
  ];

  private isStatusPending(status: APIUploadStatus): status is 'pending_update' | 'pending' {
    return status.includes('pending');
  }

  /**
   * Poll the ReadMe API until the upload is complete.
   */
  private async pollAPIUntilUploadIsComplete(slug: string, headers: Headers) {
    let count = 0;
    let status: APIUploadStatus = 'pending';

    while (this.isStatusPending(status) && count < 10) {
      await new Promise(resolve => {
        // exponential backoff — wait 1s, 2s, 4s, 8s, 16s, 32s, 30s, 30s, 30s, 30s, etc.
        setTimeout(resolve, Math.min(isTest() ? 1 : 1000 * 2 ** count, 30000));
      });

      this.debug(`polling API for status of ${slug}, count is ${count}`);
      const response = (await this.readmeAPIFetch(slug, { headers }).then(res =>
        this.handleAPIRes(res),
      )) as APIUploadSingleResponseRepresentation;

      status = response?.data?.upload?.status;
      count += 1;
    }

    if (this.isStatusPending(status)) {
      throw new Error('Sorry, this upload timed out. Please try again later.');
    }

    return status;
  }

  async run() {
    const { preparedSpec, specFileType, specType, specPath, specVersion } = await prepareOas.call(
      this,
      'openapi upload',
    );

    const branch = this.flags.useSpecVersion ? specVersion : this.flags.branch;

    const specFileTypeIsUrl = specFileType === 'url';

    let filename = specFileTypeIsUrl ? nodePath.basename(specPath) : slugify.default(specPath);

    // Our support for Postman collections relies on an internal fork of an archived project and
    // can be subject to quirks in the conversion. We should let users know that this is all very
    // experimental.
    if (specType === 'Postman') {
      this.warn('Support for Postman collections is currently experimental.');
    }

    if (!specFileTypeIsUrl && filename !== specPath && !this.flags['legacy-id'] && !this.flags.slug) {
      this.warn(
        `The slug of your API Definition will be set to ${filename} in ReadMe. This slug is not visible to your end users. To set this slug to something else, use the \`--slug\` flag.`,
      );
    }

    const headers = new Headers({ authorization: `Bearer ${this.flags.key}` });

    const existingAPIDefinitions: APIDefinitionsRepresentation['data'] =
      (await this.readmeAPIFetch(`/branches/${branch}/apis`, { headers }).then(res => this.handleAPIRes(res)))?.data ||
      [];

    /**
     * If the user provided a slug that matches an existing legacy API definition ID,
     * we'll prompt them to confirm that they want to update the file.
     * We store this in a variable so we can use it later so we can bypass the other prompt
     * to confirm the file overwrite.
     */
    let updateLegacyIdViaSlug = false;

    const fileExtension = nodePath.extname(filename);
    if (this.flags.slug) {
      // verify that the slug's extension matches the file's extension
      const slugExtension = nodePath.extname(this.flags.slug);
      if (slugExtension && (!['.json', '.yaml', '.yml'].includes(slugExtension) || fileExtension !== slugExtension)) {
        throw new Error(
          'Please provide a valid file extension that matches the extension on the file you provided. Must be `.json`, `.yaml`, or `.yml`.',
        );
      }

      // the API expects a file extension, so keep it if it's there, add it if it's not
      filename = `${this.flags.slug.replace(slugExtension, '')}${fileExtension}`;
      // handling in the event that the slug is an object ID, in which case it's likely a faulty migration
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (objectIdRegex.test(this.flags.slug)) {
        const matchedLegacyAPIDefinition = existingAPIDefinitions.find(d => d.legacy_id === this.flags.slug);
        if (matchedLegacyAPIDefinition) {
          if (isCI()) {
            throw new Error(
              `The slug you provided matches a legacy API definition ID, which have been deprecated in ReadMe. To fix this, update your \`--slug\` flag to  \`${matchedLegacyAPIDefinition.filename}\`.`,
            );
          }

          // if the slug matches an existing legacy API definition, we'll prompt the user before making that change
          const { legacyConfirm } = await promptTerminal({
            type: 'confirm',
            name: 'legacyConfirm',
            message: `The slug you provided matches the ID of a legacy API definition (${matchedLegacyAPIDefinition.filename}). Would you like to update this file?`,
          });

          if (!legacyConfirm) {
            throw new Error('Aborting, no changes were made.');
          }

          updateLegacyIdViaSlug = true;

          this.warn(
            `The slug you provided matches a legacy API definition ID and these IDs are now deprecated in ReadMe. To ensure maximum compatibility going forward, we recommend updating your \`--slug\` flag to  \`${matchedLegacyAPIDefinition.filename}\`.`,
          );

          filename = matchedLegacyAPIDefinition.filename;
        } else {
          this.warn(
            'The slug you provided looks like a legacy API definition ID, and these IDs are now deprecated in ReadMe. More info here: https://github.com/readmeio/rdme/blob/v10/documentation/migration-guide.md#v10-openapi-upload-command-updates',
          );
        }
      }
    }

    const filenames = new Intl.ListFormat('en', {
      style: 'long',
      type: 'unit',
    }).format(existingAPIDefinitions.map(d => `\`${d.filename}\``));

    this.debug(`found ${existingAPIDefinitions.length} existing API definitions: ${filenames}`);

    const matchingAPIDefinition = existingAPIDefinitions.find(d => {
      if (this.flags['legacy-id']) {
        return d?.legacy_id === this.flags['legacy-id'];
      }
      return d?.filename === filename;
    });

    if (this.flags['legacy-id']) {
      if (!matchingAPIDefinition) {
        let existingDefinitionSuggestion = ' Did you mean to use the `--slug` flag instead?';
        if (existingAPIDefinitions.length === 1) {
          existingDefinitionSuggestion = ` 1 file was found — try replacing \`--legacy-id ${this.flags['legacy-id']}\` with \`--slug ${existingAPIDefinitions[0].filename}\`.`;
        } else if (existingAPIDefinitions.length > 1) {
          existingDefinitionSuggestion = ` ${existingAPIDefinitions.length} file(s) were found — try passing one of them via the \`--slug\` flag instead: ${filenames}.`;
        }

        throw new Error(
          `No API definition found with legacy ID ${this.flags['legacy-id']}.${existingDefinitionSuggestion}`,
        );
      }
      filename = matchingAPIDefinition.filename;
      this.warn(
        `The \`--legacy-id\` flag will be removed in a future version. We recommend passing \`--slug ${filename}\` for maximum compatibility and readability.`,
      );
      this.debug(`using existing legacy ID ${this.flags['legacy-id']} with filename ${filename}`);
    }

    // if we have a matching API definition based on legacy-id or slug, we'll use PUT to update it. otherwise, we'll use POST to create it
    const method = matchingAPIDefinition ? 'PUT' : 'POST';

    this.debug(`making a ${method} request`);

    // if the file already exists, ask the user if they want to overwrite it
    if (method === 'PUT') {
      // bypass the prompt if we're in a CI environment
      prompts.override({
        confirm: isCI() || this.flags['confirm-overwrite'] || updateLegacyIdViaSlug ? true : undefined,
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

    const isYaml = fileExtension === '.yaml' || fileExtension === '.yml';
    // Convert YAML files back to YAML before uploading
    let specToUpload = preparedSpec;
    if (isYaml) {
      specToUpload = yaml.dump(JSON.parse(preparedSpec));
    }

    this.debug('processing file into form data payload');
    body.append(
      'schema',
      new File([specToUpload], filename, {
        type: isYaml ? 'application/x-yaml' : 'application/json',
      })
    );

    const options: RequestInit = { headers, method, body };

    const spinner = ora({ ...oraOptions() }).start(
      `${method === 'POST' ? 'Creating' : 'Updating'} your API definition to ReadMe...`,
    );

    const response = (await this.readmeAPIFetch(
      `/branches/${branch}/apis${method === 'POST' ? '' : `/${filename}`}`,
      options,
    )
      .then(res => this.handleAPIRes(res))
      .catch((err: Error) => {
        spinner.fail();
        throw err;
      })) as StagedAPIUploadResponseRepresentation;

    if (response?.data?.upload?.status && response?.data?.uri) {
      let status = response.data.upload.status;

      if (this.isStatusPending(status)) {
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
