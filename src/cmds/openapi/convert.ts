import type { CommandOptions } from '../../lib/baseCommand';
import type { OASDocument } from 'oas/dist/rmoas.types';

import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import prompts from 'prompts';

import Command, { CommandCategories } from '../../lib/baseCommand';
import prepareOas from '../../lib/prepareOas';
import promptTerminal from '../../lib/promptWrapper';
import { validateFilePath } from '../../lib/validatePromptInput';

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
        description: 'Output file path to write converted file to',
      },
      this.getWorkingDirArg(),
    ];
  }

  async run(opts: CommandOptions<Options>) {
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
        validate: value => validateFilePath(value),
      },
    ]);

    Command.debug(`saving converted spec to ${promptResults.outputPath}`);

    fs.writeFileSync(promptResults.outputPath, JSON.stringify(parsedPreparedSpec, null, 2));

    Command.debug('converted spec saved');

    return Promise.resolve(chalk.green(`Your converted API definition has been saved to ${promptResults.outputPath}!`));
  }
}
