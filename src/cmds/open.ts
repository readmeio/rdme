import type { CommandOptions } from '../lib/baseCommand';

import chalk from 'chalk';
import config from 'config';
import open from 'open';

import Command, { CommandCategories } from '../lib/baseCommand';
import configStore from '../lib/configstore';
import { debug } from '../lib/logger';

export type Options = {
  mockOpen?: any; // @fixme this deserves a better type
};

export default class OpenCommand extends Command {
  constructor() {
    super();

    this.command = 'open';
    this.usage = 'open';
    this.description = 'Open your current ReadMe project in the browser.';
    this.cmdCategory = CommandCategories.UTILITIES;
    this.position = 2;

    this.args = [];
  }

  async run(opts: CommandOptions<Options>) {
    super.run(opts);

    const project = configStore.get('project');
    debug(`project: ${project}`);

    if (!project) {
      return Promise.reject(new Error(`Please login using \`${config.get('cli')} login\`.`));
    }

    const hubURL: string = config.get('hub');
    const url = hubURL.replace('{project}', project);

    return (opts.mockOpen || open)(url, {
      wait: false,
    }).then(() => Promise.resolve(`Opening ${chalk.green(url)} in your browser...`));
  }
}
