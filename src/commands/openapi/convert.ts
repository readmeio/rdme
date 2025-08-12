import type { OASDocument } from 'oas/types';

import fs from 'node:fs';
import path from 'node:path';

import { Flags } from '@oclif/core';
import chalk from 'chalk';
import prompts from 'prompts';

import BaseCommand from '../../lib/baseCommand.js';
import { specArg, titleFlag, workingDirectoryFlag } from '../../lib/flags.js';
import prepareOas from '../../lib/prepareOas.js';
import promptTerminal from '../../lib/promptWrapper.js';
import { validateFilePath } from '../../lib/validatePromptInput.js';

export default class OpenAPIConvertCommand extends BaseCommand<typeof OpenAPIConvertCommand> {
  id = 'openapi convert' as const;

  static summary = 'Converts an API definition to OpenAPI and bundles any external references.';

  static description =
    'Converts Swagger files and Postman collections to OpenAPI and bundles any external references. **Note**: All of our other OpenAPI commands already do this conversion automatically, but this command is available in case you need this functionality exclusively.';

  static args = {
    spec: specArg,
  };

  static flags = {
    out: Flags.string({ description: 'Output file path to write converted file to' }),
    title: titleFlag,
    workingDirectory: workingDirectoryFlag,
  };

  static examples = [
    {
      description:
        'By default, this command will display a comprehensive table of all OpenAPI and ReadMe features found in your API definition:',
      command: '<%= config.bin %> <%= command.id %> [url-or-local-path-to-file]',
    },
    {
      description:
        'You can omit the file name and `rdme` will scan your working directory (and any subdirectories) for OpenAPI/Swagger files. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.',
      command: '<%= config.bin %> <%= command.id %>',
    },
  ];

  async run() {
    const { out, workingDirectory } = this.flags;

    if (workingDirectory) {
      const previousWorkingDirectory = process.cwd();
      process.chdir(workingDirectory);
      this.debug(`switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
    }

    const { preparedSpec, specPath, specType } = await prepareOas.call(this);
    const parsedPreparedSpec: OASDocument = JSON.parse(preparedSpec);

    if (specType === 'OpenAPI') {
      this.warn(
        'The input file is already OpenAPI, so no conversion is necessary. Any external references will be bundled.',
      );
    }

    prompts.override({
      outputPath: out,
    });

    const promptResults = await promptTerminal([
      {
        type: 'text',
        name: 'outputPath',
        message: 'Enter the path to save your converted/bundled API definition to:',
        initial: () => {
          const extension = path.extname(specPath);
          return `${path.basename(specPath).split(extension)[0]}.openapi${extension}`;
        },
        validate: value => validateFilePath(value),
      },
    ]);

    this.debug(`saving converted/bundled spec to ${promptResults.outputPath}`);

    fs.writeFileSync(promptResults.outputPath, JSON.stringify(parsedPreparedSpec, null, 2));

    this.debug('converted/bundled spec saved');

    return Promise.resolve(
      chalk.green(`Your API definition has been converted and bundled and saved to ${promptResults.outputPath}!`),
    );
  }
}
