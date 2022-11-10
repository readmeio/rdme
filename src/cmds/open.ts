import type { CommandOptions } from '../lib/baseCommand';

import chalk from 'chalk';
import config from 'config';
import open from 'open';

import Command, { CommandCategories } from '../lib/baseCommand';
import configStore from '../lib/configstore';

export type Options = {
  mockOpen?: (url: string) => Promise<void>;
  dash?: boolean;
};

export default class OpenCommand extends Command {
  constructor() {
    super();

    this.command = 'open';
    this.usage = 'open';
    this.description = 'Open your current ReadMe project in the browser.';
    this.cmdCategory = CommandCategories.UTILITIES;
    this.position = 1;

    this.args = [
      {
        name: 'dash',
        type: Boolean,
        description: 'Opens the current project dashboard.',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    const { dash } = opts;
    const project = configStore.get('project');
    Command.debug(`project: ${project}`);

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
