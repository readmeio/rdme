import { Args, Flags } from '@oclif/core';

import BaseCommand from '../lib/baseCommand.js';
import { githubFlag, keyFlag } from '../lib/flags.js';

export default class LintCommand extends BaseCommand<typeof LintCommand> {
  static summary = 'Lint Markdown files to ensure they are formatted correctly.';

  static description =
    'The path can either be a directory or a single Markdown file. Running this command with `--fix` will autofix any formatting issues deemed automatically fixable or provide errors for issues that need manual intervention.';

  static args = {
    path: Args.string({ description: 'Path to a local Markdown file or folder of Markdown files.', required: true }),
  };

  static examples = [
    {
      description:
        'Passing in a path to a directory will also upload any Markdown files that are located in subdirectories. The path input can also be individual Markdown files:',
      command: '<%= config.bin %> <%= command.id %> [path] --version={project-version}',
    },
  ];

  static flags = {
    github: githubFlag,
    key: keyFlag,
    fix: Flags.boolean({
      description: 'Runs the command and automatically fixes any formatting issues that are deemed automatically fixable.',
    }),
    quiet: Flags.boolean({
      description: 'Runs the command showing only errors in the console.',
    }),
    maxWarnings: Flags.integer({
      description: 'Number of errors to allow before exiting with an error',
      default: -1,
    }),
  };

  async run() {
    return 'something happens now';
  }
}
