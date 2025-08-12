import chalk from 'chalk';

import BaseCommand from '../lib/baseCommand.js';
import getCurrentConfig from '../lib/getCurrentConfig.js';

export default class WhoAmICommand extends BaseCommand<typeof WhoAmICommand> {
  static description = 'Displays the current user and project authenticated with ReadMe.';

  async run() {
    const { email, project } = getCurrentConfig.call(this);

    if (!email || !project) {
      return Promise.reject(new Error(`Please login using \`${this.config.bin} login\`.`));
    }

    return Promise.resolve(
      `You are currently logged in as ${chalk.green(email)} to the ${chalk.blue(project)} project.`,
    );
  }
}
