import type { ZeroAuthCommandOptions } from '../../lib/baseCommand.js';

import chalk from 'chalk';

import Command, { CommandCategories } from '../../lib/baseCommand.js';
import createGHA from '../../lib/createGHA/index.js';
import prepareOas from '../../lib/prepareOas.js';

export interface Options {
  spec?: string;
  workingDirectory?: string;
}

export default class OpenAPIValidateCommand extends Command {
  constructor() {
    super();

    this.command = 'openapi:validate';
    this.usage = 'openapi:validate [file|url] [options]';
    this.description = 'Validate your OpenAPI/Swagger definition.';
    this.cmdCategory = CommandCategories.APIS;

    this.hiddenArgs = ['spec'];
    this.args = [
      {
        name: 'spec',
        type: String,
        defaultOption: true,
      },
      this.getWorkingDirArg(),
      this.getGitHubArg(),
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

    const { specPath, specType } = await prepareOas(spec, 'openapi:validate');
    return Promise.resolve(chalk.green(`${specPath} is a valid ${specType} API definition!`)).then(msg =>
      createGHA(msg, this.command, this.args, { ...opts, spec: specPath } as ZeroAuthCommandOptions<Options>),
    );
  }
}
