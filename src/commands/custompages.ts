import { Args, Flags } from '@oclif/core';

import BaseCommand from '../lib/baseCommand.js';
import { githubFlag, keyFlag } from '../lib/flags.js';
import syncDocsPath from '../lib/syncDocsPath.legacy.js';

import DocsCommand from './docs/index.js';

export default class CustomPagesCommand extends BaseCommand<typeof CustomPagesCommand> {
  // we need this as a const for syncDocsPath
  id = 'custompages' as const;

  // needed for unit tests, even though we also specify this in src/index.ts
  static id = 'custompages' as const;

  static state = 'deprecated';

  static deprecationOptions = {
    message: `\`rdme ${this.id}\` is deprecated and will be removed in v10. For more information, please visit our migration guide: https://github.com/readmeio/rdme/tree/v9/documentation/migration-guide.md`,
  };

  static summary = 'Sync Markdown/HTML files to your ReadMe project as Custom Pages.';

  static description =
    'Syncs Markdown files as Custom Pages in your ReadMe project. The path can either be a directory or a single Markdown file. The Markdown files will require YAML frontmatter with certain ReadMe documentation attributes. Check out our docs for more info on setting up your frontmatter: https://docs.readme.com/main/docs/rdme#markdown-file-setup';

  static args = {
    path: Args.string({ description: 'Path to a local Markdown file or folder of Markdown files.', required: true }),
  };

  static examples = DocsCommand.examples;

  static flags = {
    github: githubFlag,
    key: keyFlag,
    dryRun: Flags.boolean({
      description: 'Runs the command without creating/updating any custom pages in ReadMe. Useful for debugging.',
    }),
  };

  async run() {
    return this.runCreateGHAHook({
      result: await syncDocsPath.call(this),
    });
  }
}
