import type { CommandOptions } from '../lib/baseCommand.js';

import chalk from 'chalk';
import config from 'config';

import Command, { CommandCategories } from '../lib/baseCommand.js';
import getCurrentConfig from '../lib/getCurrentConfig.js';

export default class WhoAmICommand extends Command {
  constructor() {
    super();

    this.command = 'whoami';
    this.usage = 'whoami';
    this.description = 'Displays the current user and project authenticated with ReadMe.';
    this.cmdCategory = CommandCategories.ADMIN;

    this.args = [];
  }

  async run(opts: CommandOptions<{}>) {
    await super.run(opts);

    const { email, project } = getCurrentConfig();

    if (!email || !project) {
      return Promise.reject(new Error(`Please login using \`${config.get('cli')} login\`.`));
    }

    return Promise.resolve(
      `You are currently logged in as ${chalk.green(email)} to the ${chalk.blue(project)} project.`,
    );
  }
}
