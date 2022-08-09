import type { CommandOptions } from '../lib/baseCommand';

import chalk from 'chalk';

import Command, { CommandCategories } from '../lib/baseCommand';
import prepareOas from '../lib/prepareOas';

export type Options = {
  spec?: string;
  workingDirectory?: string;
};

export default class ValidateCommand extends Command {
  constructor() {
    super();

    this.command = 'validate';
    this.usage = 'validate [file] [options]';
    this.description = 'Validate your OpenAPI/Swagger definition.';
    this.cmdCategory = CommandCategories.APIS;
    this.position = 2;

    this.hiddenArgs = ['spec'];
    this.args = [
      {
        name: 'spec',
        type: String,
        defaultOption: true,
      },
      {
        name: 'workingDirectory',
        type: String,
        description: 'Working directory (for usage with relative external references)',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    super.run(opts);

    const { spec, workingDirectory } = opts;

    if (workingDirectory) {
      process.chdir(workingDirectory);
    }

    const { specPath, specType } = await prepareOas(spec, 'validate');
    return Promise.resolve(chalk.green(`${specPath} is a valid ${specType} API definition!`));
  }
}
