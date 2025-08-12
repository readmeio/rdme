import chalk from 'chalk';

import BaseCommand from '../../lib/baseCommand.js';
import { githubFlag, specArg, workingDirectoryFlag } from '../../lib/flags.js';
import prepareOas from '../../lib/prepareOas.js';

export default class OpenAPIValidateCommand extends BaseCommand<typeof OpenAPIValidateCommand> {
  id = 'openapi validate' as const;

  static summary = 'Validate your OpenAPI/Swagger definition.';

  static description =
    'Perform a local validation of your API definition (no ReadMe account required!), which can be useful when constructing or editing your API definition.';

  // needed for unit tests, even though we also specify this in src/index.ts
  static id = 'openapi validate' as const;

  static args = {
    spec: specArg,
  };

  static examples = [
    {
      description: 'This will validate the API definition at the given URL or path:',
      command: '<%= config.bin %> <%= command.id %> [url-or-local-path-to-file]',
    },
    {
      description:
        'You can omit the file name and `rdme` will scan your working directory (and any subdirectories) for OpenAPI/Swagger files. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.',
      command: '<%= config.bin %> <%= command.id %>',
    },
  ];

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

    const { specPath, specType } = await prepareOas.call(this);

    return this.runCreateGHAHook({
      parsedOpts: { ...this.flags, spec: specPath },
      result: chalk.green(`${specPath} is a valid ${specType} API definition!`),
    });
  }
}
