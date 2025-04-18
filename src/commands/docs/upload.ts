import { Args, Flags } from '@oclif/core';

import BaseCommand from '../../lib/baseCommand.js';
import { githubFlag, keyFlag } from '../../lib/flags.js';
import syncPagePath, { type FailedPushResult, type PushResult } from '../../lib/syncPagePath.js';

const alphaNotice = 'This command is in an experimental alpha and is likely to change. Use at your own risk!';

export default class DocsUploadCommand extends BaseCommand<typeof DocsUploadCommand> {
  id = 'docs upload' as const;

  route = 'guides' as const;

  static hidden = true;

  static summary = `Upload Markdown files to the Guides section of your ReadMe project.\n\nNOTE: ${alphaNotice}`;

  static description =
    'The path can either be a directory or a single Markdown file. The Markdown files will require YAML frontmatter with certain ReadMe documentation attributes. Check out our docs for more info on setting up your frontmatter: https://docs.readme.com/main/docs/rdme#markdown-file-setup';

  static args = {
    path: Args.string({ description: 'Path to a local Markdown file or folder of Markdown files.', required: true }),
  };

  static examples = [
    {
      description:
        'The path input can be a directory. This will also upload any Markdown files that are located in subdirectories:',
      command: '<%= config.bin %> <%= command.id %> documentation/ --version={project-version}',
    },
    {
      description: 'The path input can also be individual Markdown files:',
      command: '<%= config.bin %> <%= command.id %> documentation/about.md --version={project-version}',
    },
    {
      description: 'You can omit the `--version` flag to default to the `stable` version of your project:',
      command: '<%= config.bin %> <%= command.id %> [path]',
    },
    {
      description:
        'This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about dry run mode in our docs: https://docs.readme.com/main/docs/rdme#dry-run-mode',
      command: '<%= config.bin %> <%= command.id %> [path] --dry-run',
    },
  ];

  static flags = {
    github: githubFlag,
    key: keyFlag,
    'dry-run': Flags.boolean({
      description: 'Runs the command without creating nor updating any Guides in ReadMe. Useful for debugging.',
      aliases: ['dryRun'],
      deprecateAliases: true,
    }),
    'skip-validation': Flags.boolean({
      description:
        'Skips the pre-upload validation of the Markdown files. This flag can be a useful escape hatch but its usage is not recommended.',
      hidden: true,
    }),
    version: Flags.string({
      summary: 'ReadMe project version',
      description: 'Defaults to `stable` (i.e., your main project version).',
      default: 'stable',
    }),
  };

  async run(): Promise<{
    created: PushResult[];
    failed: FailedPushResult[];
    skipped: PushResult[];
    updated: PushResult[];
  }> {
    this.warn(alphaNotice);
    return syncPagePath.call(this);
  }
}
