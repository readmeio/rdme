import type { CommandOptions } from '../../lib/baseCommand';

import chalk from 'chalk';
import config from 'config';

import Command, { CommandCategories } from '../../lib/baseCommand';
import { debug } from '../../lib/logger';
import pushDoc, { readdirRecursive } from '../../lib/pushDoc';
import { getProjectVersion } from '../../lib/versionSelect';

export type Options = {
  dryRun?: boolean;
  folder?: string;
};

export default class DocsCommand extends Command {
  constructor() {
    super();

    this.command = 'docs';
    this.usage = 'docs <folder> [options]';
    this.description = 'Sync a folder of Markdown files to your ReadMe project.';
    this.cmdCategory = CommandCategories.DOCS;
    this.position = 1;

    this.hiddenArgs = ['folder'];
    this.args = [
      {
        name: 'key',
        type: String,
        description: 'Project API key',
      },
      {
        name: 'version',
        type: String,
        description: 'Project version',
      },
      {
        name: 'folder',
        type: String,
        defaultOption: true,
      },
      {
        name: 'dryRun',
        type: Boolean,
        description: 'Runs the command without creating/updating any docs in ReadMe. Useful for debugging.',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    super.run(opts, true);

    const { dryRun, folder, key, version } = opts;

    if (!folder) {
      return Promise.reject(new Error(`No folder provided. Usage \`${config.get('cli')} ${this.usage}\`.`));
    }

    // TODO: should we allow version selection at all here?
    // Let's revisit this once we re-evaluate our category logic in the API.
    // Ideally we should ignore this parameter entirely if the category is included.
    const selectedVersion = await getProjectVersion(version, key, false);

    debug(`selectedVersion: ${selectedVersion}`);

    // Strip out non-markdown files
    const files = readdirRecursive(folder).filter(
      file => file.toLowerCase().endsWith('.md') || file.toLowerCase().endsWith('.markdown')
    );

    debug(`number of files: ${files.length}`);

    if (!files.length) {
      return Promise.reject(new Error(`We were unable to locate Markdown files in ${folder}.`));
    }

    const updatedDocs = await Promise.all(
      files.map(async filename => {
        return pushDoc(key, selectedVersion, dryRun, filename, this.cmdCategory);
      })
    );

    return chalk.green(updatedDocs.join('\n'));
  }
}
