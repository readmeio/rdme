const chalk = require('chalk');
const config = require('config');
const configStore = require('../lib/configstore');
const { debug } = require('../lib/logger');

module.exports = class WhoAmICommand {
  constructor() {
    this.command = 'whoami';
    this.usage = 'whoami';
    this.description = 'Displays the current user and project authenticated with ReadMe.';
    this.category = 'admin';
    this.position = 3;

    this.args = [];
  }

  async run() {
    debug(`command: ${this.command}`);

    if (!configStore.has('email') || !configStore.has('project')) {
      return Promise.reject(new Error(`Please login using \`${config.get('cli')} login\`.`));
    }

    return Promise.resolve(
      `You are currently logged in as ${chalk.green(configStore.get('email'))} to the ${chalk.blue(
        configStore.get('project')
      )} project.`
    );
  }
};
