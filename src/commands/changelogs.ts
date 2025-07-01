import { Args, Flags } from '@oclif/core';

import BaseCommand from '../lib/baseCommand.js';
import { githubFlag, keyFlag } from '../lib/flags.js';
import syncDocsPath from '../lib/syncDocsPath.legacy.js';

export default class ChangelogsCommand extends BaseCommand<typeof ChangelogsCommand> {
  static hidden = true;

  static state = 'deprecated';

  // we need this as a const for syncDocsPath
  id = 'changelogs' as const;

  // needed for unit tests, even though we also specify this in src/index.ts
  static id = 'changelogs' as const;

  static deprecationOptions = {
    message: `\`rdme ${this.id}\` is deprecated in favor of \`rdme changelog upload\`. For more information, please visit our migration guide: https://github.com/readmeio/rdme/tree/v9/documentation/migration-guide.md`,
  };

  static summary = 'Upload Markdown files to your ReadMe project as Changelog posts.';

  static description =
    'Syncs Markdown files to the Changelog section of your ReadMe project. The path can either be a directory or a single Markdown file. The Markdown files will require YAML frontmatter with certain ReadMe documentation attributes. Check out our docs for more info on setting up your frontmatter: https://docs.readme.com/main/docs/rdme#markdown-file-setup';

  static args = {
    path: Args.string({ description: 'Path to a local Markdown file or folder of Markdown files.', required: true }),
  };

  static examples = [
    {
      description:
        'Passing in a path to a directory will also upload any Markdown files that are located in subdirectories. The path input can also be individual Markdown files:',
      command: '<%= config.bin %> <%= command.id %> [path] --version={project-version}',
    },
    {
      description:
        'This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about dry run mode in our docs: https://docs.readme.com/main/docs/rdme#dry-run-mode',
      command: '<%= config.bin %> <%= command.id %> [path] --version={project-version} --dryRun',
    },
  ];

  static flags = {
    key: keyFlag,
    dryRun: Flags.boolean({
      description: 'Runs the command without creating nor updating any changelogs in ReadMe. Useful for debugging.',
    }),
    github: githubFlag,
  };

  async run() {
    return this.runCreateGHAHook({
      result: await syncDocsPath.call(this),
    });
  }
}
