import { Args, Flags } from '@oclif/core';

import BaseCommand from '../../lib/baseCommandNew.js';
import { githubFlag, keyFlag, versionFlag } from '../../lib/flags.js';
import syncDocsPath from '../../lib/syncDocsPath.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

export default class DocsCommand extends BaseCommand<typeof DocsCommand> {
  // we need this as a const for syncDocsPath
  id = 'docs' as const;

  static aliases = ['guides'];

  static description =
    'Sync Markdown files to your ReadMe project as Guides. Can either be a path to a directory or a single Markdown file.';

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
