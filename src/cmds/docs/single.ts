import type { CommandOptions } from '../../lib/baseCommand';

import chalk from 'chalk';
import config from 'config';

import Command, { CommandCategories } from '../../lib/baseCommand';
import createGHA from '../../lib/createGHA';
import pushDoc from '../../lib/pushDoc';
import { getProjectVersion } from '../../lib/versionSelect';

export type Options = {
  dryRun?: boolean;
  filePath?: string;
};

export default class SingleDocCommand extends Command {
  constructor() {
    super();

    this.command = 'docs:single';
    this.usage = 'docs:single <file> [options]';
    this.description = 'Sync a single Markdown file to your ReadMe project.';
    this.cmdCategory = CommandCategories.DOCS;
    this.position = 3;

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
    super.run(opts);

    const { dryRun, filePath, key, version } = opts;

    if (!filePath) {
      return Promise.reject(new Error(`No file path provided. Usage \`${config.get('cli')} ${this.usage}\`.`));
    }

    if (!(filePath.toLowerCase().endsWith('.md') || filePath.toLowerCase().endsWith('.markdown'))) {
      return Promise.reject(new Error('The file path specified is not a Markdown file.'));
    }

    // TODO: should we allow version selection at all here?
    // Let's revisit this once we re-evaluate our category logic in the API.
    // Ideally we should ignore this parameter entirely if the category is included.
    const selectedVersion = await getProjectVersion(version, key, false);

    Command.debug(`selectedVersion: ${selectedVersion}`);

    const createdDoc = await pushDoc(key, selectedVersion, dryRun, filePath, this.cmdCategory);

    return Promise.resolve(chalk.green(createdDoc)).then(msg =>
      createGHA(msg, this.command, this.args, { ...opts, version: selectedVersion })
    );
  }
}
