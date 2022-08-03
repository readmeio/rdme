import chalk from 'chalk';
import { debug } from '../lib/logger.js';
import prepareOas from '../lib/prepareOas.js';

export default class ValidateCommand {
  constructor() {
    this.command = 'validate';
    this.usage = 'validate [file] [options]';
    this.description = 'Validate your OpenAPI/Swagger definition.';
    this.cmdCategory = 'apis';
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

  async run(opts) {
    const { spec, workingDirectory } = opts;

    if (workingDirectory) {
      process.chdir(workingDirectory);
    }

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    const { specPath, specType } = await prepareOas(spec, this.command);
    return Promise.resolve(chalk.green(`${specPath} is a valid ${specType} API definition!`));
  }
}
