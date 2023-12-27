import { Args } from '@oclif/core';
import chalk from 'chalk';

import Command from '../../lib/baseCommand.js';
import BaseCommand from '../../lib/baseCommandNew.js';
import { github as githubArg, workingDirectory as workingDirectoryArg } from '../../lib/flags.js';
import prepareOas from '../../lib/prepareOas.js';

export interface Options {
  spec?: string;
  workingDirectory?: string;
}

export default class OpenAPIValidateCommand extends BaseCommand<typeof OpenAPIValidateCommand> {
  static description = 'Validate your OpenAPI/Swagger definition.';

  static hiddenAliases = ['validate'];

  static args = {
    spec: Args.string({ description: 'A file/URL to your API definition' }),
  };

  static flags = {
    github: githubArg,
    workingDirectory: workingDirectoryArg,
  };

  async run(): Promise<string> {
    if (this.flags.workingDirectory) {
      const previousWorkingDirectory = process.cwd();
      process.chdir(this.flags.workingDirectory);
      Command.debug(`switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
    }

    const { specPath, specType } = await prepareOas(this.args.spec, 'openapi:validate');

    return this.runCreateGHAHook({
      parsedOpts: { ...this.flags, spec: specPath },
      result: chalk.green(`${specPath} is a valid ${specType} API definition!`),
    });
  }
}
