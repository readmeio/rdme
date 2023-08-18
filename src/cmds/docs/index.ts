import type { CommandOptions } from '../../lib/baseCommand';

import Command, { CommandCategories } from '../../lib/baseCommand';
import createGHA from '../../lib/createGHA';
import syncDocsPath from '../../lib/syncDocsPath';
import { getProjectVersion } from '../../lib/versionSelect';

export interface Options {
  dryRun?: boolean;
  filePath?: string;
}

export default class DocsCommand extends Command {
  constructor() {
    super();

    this.command = 'docs';
    this.usage = 'docs <path> [options]';
    this.description =
      'Sync Markdown files to your ReadMe project as Guides. Can either be a path to a directory or a single Markdown file.';
    this.cmdCategory = CommandCategories.DOCS;

    this.hiddenArgs = ['filePath'];
    this.args = [
      this.getKeyArg(),
      this.getVersionArg(),
      {
        name: 'filePath',
        type: String,
        defaultOption: true,
      },
      this.getGitHubArg(),
      {
        name: 'dryRun',
        type: Boolean,
        description: 'Runs the command without creating/updating any docs in ReadMe. Useful for debugging.',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    const { dryRun, filePath, key, version } = opts;

    // TODO: should we allow version selection at all here?
    // Let's revisit this once we re-evaluate our category logic in the API.
    // Ideally we should ignore this parameter entirely if the category is included.
    const selectedVersion = await getProjectVersion(version, key);

    return syncDocsPath(key, selectedVersion, this.cmdCategory, this.usage, filePath, dryRun).then(msg =>
      createGHA(msg, this.command, this.args, { ...opts, version: selectedVersion }),
    );
  }
}
