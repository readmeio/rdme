import type { ZeroAuthCommandOptions } from '../lib/baseCommand';

import chalk from 'chalk';

import Command, { CommandCategories } from '../lib/baseCommand';
import config from '../lib/config';
import getCurrentConfig from '../lib/getCurrentConfig';

export default class WhoAmICommand extends Command {
  constructor() {
    super();

    this.command = 'whoami';
    this.usage = 'whoami';
    this.description = 'Displays the current user and project authenticated with ReadMe.';
    this.cmdCategory = CommandCategories.ADMIN;

    this.args = [];
  }

  async run(opts: ZeroAuthCommandOptions<{}>) {
    await super.run(opts);

    const { email, project } = getCurrentConfig();

    if (!email || !project) {
      return Promise.reject(new Error(`Please login using \`${config.cli} login\`.`));
    }

    return Promise.resolve(
      `You are currently logged in as ${chalk.green(email)} to the ${chalk.blue(project)} project.`,
    );
  }
}
