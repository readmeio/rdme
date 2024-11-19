import type { OASDocument } from 'oas/types';

import fs from 'node:fs';
import path from 'node:path';

import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import prompts from 'prompts';

import BaseCommand from '../../lib/baseCommand.js';
import { workingDirectoryFlag } from '../../lib/flags.js';
import { warn } from '../../lib/logger.js';
import prepareOas from '../../lib/prepareOas.js';
import promptTerminal from '../../lib/promptWrapper.js';
import { validateFilePath } from '../../lib/validatePromptInput.js';

export default class OpenAPIConvertCommand extends BaseCommand<typeof OpenAPIConvertCommand> {
  static description = 'Convert an API definition to OpenAPI and bundle any external references.';

  static args = {
    spec: Args.string({ description: 'A file/URL to your API definition' }),
  };

  static flags = {
    out: Flags.string({ description: 'Output file path to write converted file to' }),
    workingDirectory: workingDirectoryFlag,
  };

  async run() {
    const { spec } = this.args;
    const { out, workingDirectory } = this.flags;

    if (workingDirectory) {
      const previousWorkingDirectory = process.cwd();
      process.chdir(workingDirectory);
      this.debug(`switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
    }

    const { preparedSpec, specPath, specType } = await prepareOas(spec, 'openapi:convert', { convertToLatest: true });
    const parsedPreparedSpec: OASDocument = JSON.parse(preparedSpec);

    if (specType === 'OpenAPI') {
      warn(
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
