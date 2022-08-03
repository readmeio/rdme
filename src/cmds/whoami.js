import chalk from 'chalk';
import config from 'config';
import configStore from '../lib/configstore.js';
import { debug } from '../lib/logger.js';

export default class WhoAmICommand {
  constructor() {
    this.command = 'whoami';
    this.usage = 'whoami';
    this.description = 'Displays the current user and project authenticated with ReadMe.';
    this.cmdCategory = 'admin';
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
}
