const chalk = require('chalk');
const config = require('config');

const { debug } = require('../../lib/logger');
const pushDoc = require('../../lib/pushDoc');

module.exports = class SingleCustomPageCommand {
  constructor() {
    this.command = 'custompages:single';
    this.usage = 'custompages:single <file> [options]';
    this.description = 'Sync a single Markdown file to your ReadMe project as a Custom Page.';
    this.cmdCategory = 'custompages';
    this.position = 2;

    this.hiddenArgs = ['filePath'];
    this.args = [
      {
        name: 'key',
        type: String,
        description: 'Project API key',
      },
      {
        name: 'filePath',
        type: String,
        defaultOption: true,
      },
      {
        name: 'dryRun',
        type: Boolean,
        description: 'Runs the command without creating/updating any custom pages in ReadMe. Useful for debugging.',
      },
    ];
  }

  async run(opts) {
    const { dryRun, filePath, key } = opts;
    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    if (!filePath) {
      return Promise.reject(new Error(`No file path provided. Usage \`${config.get('cli')} ${this.usage}\`.`));
    }

    if (
      !(
        filePath.toLowerCase().endsWith('.html') ||
        filePath.toLowerCase().endsWith('.md') ||
        filePath.toLowerCase().endsWith('.markdown')
      )
    ) {
      return Promise.reject(new Error('The file path specified is not a Markdown or HTML file.'));
    }

    const createdDoc = await pushDoc(key, undefined, dryRun, filePath, this.cmdCategory);

    return chalk.green(createdDoc);
  }
};
