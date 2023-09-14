import type { ZeroAuthCommandOptions } from '../lib/baseCommand';

import Command, { CommandCategories } from '../lib/baseCommand';
import config from '../lib/config';
import configStore from '../lib/configstore';

export default class LogoutCommand extends Command {
  constructor() {
    super();

    this.command = 'logout';
    this.usage = 'logout';
    this.description = 'Logs the currently authenticated user out of ReadMe.';
    this.cmdCategory = CommandCategories.ADMIN;

    this.args = [];
  }

  async run(opts: ZeroAuthCommandOptions) {
    await super.run(opts);

    if (configStore.has('email') && configStore.has('project')) {
      configStore.clear();
    }

    return Promise.resolve(`You have logged out of ReadMe. Please use \`${config.cli} login\` to login again.`);
  }
}
