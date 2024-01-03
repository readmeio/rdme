import { Args, Flags } from '@oclif/core';

import { CommandCategories } from '../lib/baseCommand.js';
import BaseCommand from '../lib/baseCommandNew.js';
import { githubFlag, keyFlag } from '../lib/flags.js';
import syncDocsPath from '../lib/syncDocsPath.js';

export default class CustomPagesCommand extends BaseCommand<typeof CustomPagesCommand> {
  static description =
    'Sync Markdown/HTML files to your ReadMe project as Custom Pages. Can either be a path to a directory or a single Markdown/HTML file.';

  static args = {
    path: Args.string({ description: 'Path to a local Markdown file or folder of Markdown files.', required: true }),
  };

  static flags = {
    github: githubFlag,
    key: keyFlag,
    dryRun: Flags.boolean({
      description: 'Runs the command without creating/updating any custom pages in ReadMe. Useful for debugging.',
    }),
  };

  async run(): Promise<string> {
    const { path } = this.args;
    const { dryRun, key } = this.flags;

    return this.runCreateGHAHook({
      result: await syncDocsPath(
        key as string,
        undefined,
        CommandCategories.CUSTOM_PAGES,
        this.id as string,
        path,
        dryRun,
        ['.html', '.markdown', '.md'],
      ),
    });
  }
}
