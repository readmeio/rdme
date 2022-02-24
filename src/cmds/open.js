const chalk = require('chalk');
const config = require('config');
const open = require('open');
const configStore = require('../lib/configstore');
const { debug } = require('../lib/logger');

module.exports = class OpenCommand {
  constructor() {
    this.command = 'open';
    this.usage = 'open';
    this.description = 'Open your current ReadMe project in the browser.';
    this.category = 'utilities';
    this.position = 2;

    this.args = [];
  }

  async run(opts) {
    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    const project = configStore.get('project');
    debug(`project: ${project}`);

    if (!project) {
      return Promise.reject(new Error(`Please login using \`${config.get('cli')} login\`.`));
    }

    const url = config.get('hub').replace('{project}', project);

    return (opts.mockOpen || open)(url, {
      wait: false,
      url: true,
    }).then(() => Promise.resolve(`Opening ${chalk.green(url)} in your browser...`));
  }
};
