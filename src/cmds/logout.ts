import type { CommandOptions } from '../lib/baseCommand.js';

import config from 'config';

import Command, { CommandCategories } from '../lib/baseCommand.js';
import configStore from '../lib/configstore.js';

export default class LogoutCommand extends Command {
  constructor() {
    super();

    this.command = 'logout';
    this.usage = 'logout';
    this.description = 'Logs the currently authenticated user out of ReadMe.';
    this.cmdCategory = CommandCategories.ADMIN;

    this.args = [];
  }

  async run(opts: CommandOptions<{}>) {
    await super.run(opts);

    if (configStore.has('email') && configStore.has('project')) {
      configStore.clear();
    }

    return Promise.resolve(`You have logged out of ReadMe. Please use \`${config.get('cli')} login\` to login again.`);
  }
}
