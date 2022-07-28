const chalk = require('chalk');
const config = require('config');

const { debug } = require('../../lib/logger');
const { getProjectVersion } = require('../../lib/versionSelect');
const pushDoc = require('../../lib/pushDoc');

module.exports = class SingleDocCommand {
  constructor() {
    this.command = 'docs:single';
    this.usage = 'docs:single <file> [options]';
    this.description = 'Sync a single Markdown file to your ReadMe project.';
    this.cmdCategory = 'docs';
    this.position = 3;

    this.hiddenArgs = ['filePath'];
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
        name: 'filePath',
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

  async run(opts) {
    const { dryRun, filePath, key, version } = opts;
    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

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

    debug(`selectedVersion: ${selectedVersion}`);

    const createdDoc = await pushDoc(key, selectedVersion, dryRun, filePath, this.cmdCategory);

    return chalk.green(createdDoc);
  }
};
