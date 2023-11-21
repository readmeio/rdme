import type { ZeroAuthCommandOptions } from '../../lib/baseCommand.js';
import type { OASDocument } from 'oas/types';

import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import prompts from 'prompts';

import Command, { CommandCategories } from '../../lib/baseCommand.js';
import prepareOas from '../../lib/prepareOas.js';
import promptTerminal from '../../lib/promptWrapper.js';
import { validateFilePath } from '../../lib/validatePromptInput.js';

interface Options {
  out?: string;
  spec?: string;
  workingDirectory?: string;
}

export default class OpenAPIConvertCommand extends Command {
  constructor() {
    super();

    this.command = 'openapi:convert';
    this.usage = 'openapi:convert [file|url] [options]';
    this.description = 'Convert an API definition to OpenAPI and bundle any external references.';
    this.cmdCategory = CommandCategories.APIS;

    this.hiddenArgs = ['spec'];
    this.args = [
      {
        name: 'spec',
        type: String,
        defaultOption: true,
      },
      {
        name: 'out',
        type: String,
        description: 'Output file path to write converted file to',
      },
      this.getWorkingDirArg(),
    ];
  }

  async run(opts: ZeroAuthCommandOptions<Options>) {
    await super.run(opts);

    const { spec, workingDirectory } = opts;

    if (workingDirectory) {
      const previousWorkingDirectory = process.cwd();
      process.chdir(workingDirectory);
      Command.debug(`switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
    }

    const { preparedSpec, specPath, specType } = await prepareOas(spec, 'openapi:convert', { convertToLatest: true });
    const parsedPreparedSpec: OASDocument = JSON.parse(preparedSpec);

    if (specType === 'OpenAPI') {
      Command.warn(
        'The input file is already OpenAPI, so no conversion is necessary. Any external references will be bundled.',
      );
    }

    prompts.override({
      outputPath: opts.out,
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

    Command.debug(`saving converted/bundled spec to ${promptResults.outputPath}`);

    fs.writeFileSync(promptResults.outputPath, JSON.stringify(parsedPreparedSpec, null, 2));

    Command.debug('converted/bundled spec saved');

    return Promise.resolve(
      chalk.green(`Your API definition has been converted and bundled and saved to ${promptResults.outputPath}!`),
    );
  }
}
