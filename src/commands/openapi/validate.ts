import { Args } from '@oclif/core';
import chalk from 'chalk';

import BaseCommand from '../../lib/baseCommand.js';
import { githubFlag, workingDirectoryFlag } from '../../lib/flags.js';
import prepareOas from '../../lib/prepareOas.js';

export default class OpenAPIValidateCommand extends BaseCommand<typeof OpenAPIValidateCommand> {
  static description = 'Validate your OpenAPI/Swagger definition.';

  // needed for unit tests, even though we also specify this in src/index.ts
  static id = 'openapi:validate';

  static args = {
    spec: Args.string({ description: 'A file/URL to your API definition' }),
  };

  static flags = {
    github: githubFlag,
    workingDirectory: workingDirectoryFlag,
  };

  async run() {
    if (this.flags.workingDirectory) {
      const previousWorkingDirectory = process.cwd();
      process.chdir(this.flags.workingDirectory);
      this.debug(`switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
    }

    const { specPath, specType } = await prepareOas(this.args.spec, 'openapi:validate');

    return this.runCreateGHAHook({
      parsedOpts: { ...this.flags, spec: specPath },
      result: chalk.green(`${specPath} is a valid ${specType} API definition!`),
    });
  }
}
