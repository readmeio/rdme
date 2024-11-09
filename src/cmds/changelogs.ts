import { Args, Flags } from '@oclif/core';

import BaseCommand from '../lib/baseCommand.js';
import { githubFlag, keyFlag } from '../lib/flags.js';
import syncDocsPath from '../lib/syncDocsPath.js';

export default class ChangelogsCommand extends BaseCommand<typeof ChangelogsCommand> {
  // we need this as a const for syncDocsPath
  id = 'changelogs' as const;

  // needed for unit tests, even though we also specify this in src/index.ts
  static id = 'changelogs' as const;

  static description =
    'Sync Markdown files to your ReadMe project as Changelog posts. Can either be a path to a directory or a single Markdown file.';

  static args = {
    path: Args.string({ description: 'Path to a local Markdown file or folder of Markdown files.', required: true }),
  };

  static flags = {
    github: githubFlag,
    key: keyFlag,
    dryRun: Flags.boolean({
      description: 'Runs the command without creating/updating any changelogs in ReadMe. Useful for debugging.',
    }),
  };

  async run() {
    return this.runCreateGHAHook({
      result: await syncDocsPath.call(this),
    });
  }
}
