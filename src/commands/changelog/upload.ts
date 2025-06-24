import { Args, Flags } from '@oclif/core';

import BaseCommand from '../../lib/baseCommand.js';
import { confirmAutofixesFlag, keyFlag } from '../../lib/flags.js';
import syncPagePath, {
  type FailedPushResult,
  type SkippedPushResult,
  type CreatePushResult,
  type UpdatePushResult,
} from '../../lib/syncPagePath.js';

const alphaNotice = 'This command is in an experimental alpha and is likely to change. Use at your own risk!';

export default class ChangelogUploadCommand extends BaseCommand<typeof ChangelogUploadCommand> {
  id = 'changelog upload' as const;

  route = 'changelogs' as const;

  static hidden = true;

  static summary = `Upload Markdown files to the Changelog section of your ReadMe project.\n\nNOTE: ${alphaNotice}`;

  static description =
    'The path can either be a directory or a single Markdown file. The Markdown files will require YAML frontmatter with certain ReadMe documentation attributes. Check out our docs for more info on setting up your frontmatter: https://docs.readme.com/main/docs/rdme#markdown-file-setup';

  static args = {
    path: Args.string({ description: 'Path to a local Markdown file or folder of Markdown files.', required: true }),
  };

  static examples = [
    {
      description:
        'The path input can be a directory. This will also upload any Markdown files that are located in subdirectories:',
      command: '<%= config.bin %> <%= command.id %> documentation/',
    },
    {
      description: 'The path input can also be individual Markdown files:',
      command: '<%= config.bin %> <%= command.id %> documentation/about.md',
    },
    {
      description:
        'This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about dry run mode in our docs: https://docs.readme.com/main/docs/rdme#dry-run-mode',
      command: '<%= config.bin %> <%= command.id %> [path] --dry-run',
    },
  ];

  static flags = {
    key: keyFlag,
    'confirm-autofixes': confirmAutofixesFlag,
    'dry-run': Flags.boolean({
      description:
        'Runs the command without creating nor updating any Changelog entries in ReadMe. Useful for debugging.',
      aliases: ['dryRun'],
      deprecateAliases: true,
    }),
    'hide-experimental-warning': Flags.boolean({
      description: 'Hides the warning message about this command being in an experimental alpha.',
      hidden: true,
    }),
    'max-errors': Flags.integer({
      summary: 'Maximum number of page uploading errors before the command throws an error.',
      description:
        'By default, this command will respond with a 1 exit code if any number of the Markdown files fail to upload. This flag allows you to set a maximum number of errors before the command fails. For example, if you set this flag to `5`, the command will respond with an error if 5 or more errors are encountered. If you do not want the command to fail under any circumstances (this could be useful for plugins where you want to handle the error handling yourself), set this flag to `-1`.',
      default: 0,
      hidden: true,
    }),
    'skip-validation': Flags.boolean({
      description:
        'Skips the pre-upload validation of the Markdown files. This flag can be a useful escape hatch but its usage is not recommended.',
      hidden: true,
    }),
  };

  async run(): Promise<{
    created: CreatePushResult[];
    failed: FailedPushResult[];
    skipped: SkippedPushResult[];
    updated: UpdatePushResult[];
  }> {
    if (!this.flags['hide-experimental-warning']) {
      this.warn(alphaNotice);
    }
    return syncPagePath.call(this);
  }
}
