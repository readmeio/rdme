import { Args, Flags } from '@oclif/core';

import BaseCommand from '../lib/baseCommand.js';
import { githubFlag, keyFlag } from '../lib/flags.js';
import syncDocsPath from '../lib/syncDocsPath.js';

import DocsCommand from './docs/index.js';

export default class ChangelogsCommand extends BaseCommand<typeof ChangelogsCommand> {
  // we need this as a const for syncDocsPath
  id = 'changelogs' as const;

  // needed for unit tests, even though we also specify this in src/index.ts
  static id = 'changelogs' as const;

  static summary = 'Sync Markdown files to your ReadMe project as Changelog posts.';

  static description =
    'Syncs Markdown files to the Changelog section of your ReadMe project. The path can either be a directory or a single Markdown file. The Markdown files will require YAML front matter with certain ReadMe documentation attributes. Check out our docs for more info on setting up your front matter: https://docs.readme.com/main/docs/rdme#markdown-file-setup';

  static args = {
    path: Args.string({ description: 'Path to a local Markdown file or folder of Markdown files.', required: true }),
  };

  static examples = DocsCommand.examples;

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
