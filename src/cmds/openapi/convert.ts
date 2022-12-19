import type { CommandOptions } from '../../lib/baseCommand';

import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import prompts from 'prompts';

import Command, { CommandCategories } from '../../lib/baseCommand';
import { checkFilePath } from '../../lib/checkFile';
import prepareOas from '../../lib/prepareOas';
import promptTerminal from '../../lib/promptWrapper';

export interface Options {
  spec?: string;
  out?: string;
  workingDirectory?: string;
}

export default class OpenAPIConvertCommand extends Command {
  constructor() {
    super();

    this.command = 'openapi:convert';
    this.usage = 'openapi:convert [file|url] [options]';
    this.description = 'Convert a Swagger or Postman Collection to OpenAPI.';
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
        description: 'Output file path to write reduced file to',
      },
      {
        name: 'workingDirectory',
        type: String,
        description: 'Working directory (for usage with relative external references)',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    const { spec, workingDirectory } = opts;

    if (workingDirectory) {
      process.chdir(workingDirectory);
    }

    const { bundledSpec, specPath, specType } = await prepareOas(spec, 'openapi:convert', { convertToLatest: true });
    const parsedBundledSpec = JSON.parse(bundledSpec);

    if (specType === 'OpenAPI') {
      throw new Error("Sorry, this API definition is already an OpenAPI definition and doesn't need to be converted.");
    }

    prompts.override({
      outputPath: opts.out,
    });

    const promptResults = await promptTerminal([
      {
        type: 'text',
        name: 'outputPath',
        message: 'Enter the path to save your converted API definition to:',
        initial: () => {
          const extension = path.extname(specPath);
          return `${path.basename(specPath).split(extension)[0]}.openapi${extension}`;
        },
        validate: value => checkFilePath(value),
      },
    ]);

    Command.debug(`saving converted spec to ${promptResults.outputPath}`);

    fs.writeFileSync(promptResults.outputPath, JSON.stringify(parsedBundledSpec, null, 2));

    Command.debug('converted spec saved');

    return Promise.resolve(chalk.green(`Your converted API definition has been saved to ${promptResults.outputPath}!`));
  }
}
