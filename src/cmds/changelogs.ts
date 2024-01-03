import { Args, Flags } from '@oclif/core';

import { CommandCategories } from '../lib/baseCommand.js';
import BaseCommand from '../lib/baseCommandNew.js';
import { githubFlag, keyFlag } from '../lib/flags.js';
import syncDocsPath from '../lib/syncDocsPath.js';

export default class ChangelogsCommand extends BaseCommand<typeof ChangelogsCommand> {
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

  async run(): Promise<string> {
    const { path } = this.args;
    const { dryRun, key } = this.flags;

    return this.runCreateGHAHook({
      result: await syncDocsPath(key, undefined, CommandCategories.CHANGELOGS, this.id as string, path, dryRun),
    });
  }
}
