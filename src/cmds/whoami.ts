import chalk from 'chalk';

import BaseCommand from '../lib/baseCommandNew.js';
import config from '../lib/config.js';
import getCurrentConfig from '../lib/getCurrentConfig.js';

export default class WhoAmICommand extends BaseCommand {
  static description = 'Displays the current user and project authenticated with ReadMe.';

  async run() {
    const { email, project } = getCurrentConfig();

    if (!email || !project) {
      return Promise.reject(new Error(`Please login using \`${config.cli} login\`.`));
    }

    return Promise.resolve(
      `You are currently logged in as ${chalk.green(email)} to the ${chalk.blue(project)} project.`,
    );
  }
}
