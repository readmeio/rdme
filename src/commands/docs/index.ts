import { Args, Flags } from '@oclif/core';

import BaseCommand from '../../lib/baseCommand.js';
import { githubFlag, keyFlag, versionFlag } from '../../lib/flags.js';
import syncDocsPath from '../../lib/syncDocsPath.legacy.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

export default class DocsCommand extends BaseCommand<typeof DocsCommand> {
  // we need this as a const for syncDocsPath
  id = 'docs' as const;

  // needed for unit tests, even though we also specify this in src/index.ts
  static id = 'docs' as const;

  static state = 'deprecated';

  static deprecationOptions = {
    message: `\`rdme ${this.id}\` is deprecated and will be removed in v10. For more information, please visit our migration guide: https://github.com/readmeio/rdme/tree/v9/documentation/migration-guide.md`,
  };

  static aliases = ['guides'];

  static summary = 'Sync Markdown files to your ReadMe project as Guides.';

  static description =
    'Syncs Markdown files to the Guides section of your ReadMe project. The path can either be a directory or a single Markdown file. The Markdown files will require YAML front matter with certain ReadMe documentation attributes. Check out our docs for more info on setting up your front matter: https://docs.readme.com/main/docs/rdme#markdown-file-setup';

  static args = {
    path: Args.string({ description: 'Path to a local Markdown file or folder of Markdown files.', required: true }),
  };

  static flags = {
    key: keyFlag,
    version: versionFlag,
    github: githubFlag,
    dryRun: Flags.boolean({
      description: 'Runs the command without creating/updating any docs in ReadMe. Useful for debugging.',
    }),
  };

  static examples = [
    {
      description:
        'Passing in a path to a directory will also sync any Markdown files that are located in subdirectories. The path input can also be individual Markdown files:',
      command: '<%= config.bin %> <%= command.id %> [path] --version={project-version}',
    },
    {
      description:
        'This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about dry run mode in our docs: https://docs.readme.com/main/docs/rdme#dry-run-mode',
      command: '<%= config.bin %> <%= command.id %> [path] --version={project-version} --dryRun',
    },
  ];

  async run() {
    const { key, version } = this.flags;

    // TODO: should we allow version selection at all here?
    // Let's revisit this once we re-evaluate our category logic in the API.
    // Ideally we should ignore this parameter entirely if the category is included.
    const selectedVersion = await getProjectVersion(version, key);

    return this.runCreateGHAHook({
      result: await syncDocsPath.call(this, selectedVersion),
      parsedOpts: { ...this.args, ...this.flags, version: selectedVersion },
    });
  }
}
