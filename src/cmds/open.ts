import type { CommandOptions } from '../lib/baseCommand.js';

import chalk from 'chalk';
import open from 'open';

import Command, { CommandCategories } from '../lib/baseCommand.js';
import config from '../lib/config.js';
import getCurrentConfig from '../lib/getCurrentConfig.js';
import { getProjectVersion } from '../lib/versionSelect.js';

interface Options {
  dash?: boolean;
  mockOpen?: (url: string) => Promise<void>;
}

export default class OpenCommand extends Command {
  constructor() {
    super();

    this.command = 'open';
    this.usage = 'open';
    this.description = 'Open your current ReadMe project in the browser.';
    this.cmdCategory = CommandCategories.UTILITIES;

    this.args = [
      {
        name: 'dash',
        type: Boolean,
        description: 'Opens your current ReadMe project dashboard.',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    const { dash } = opts;
    const { apiKey, project } = getCurrentConfig();
    Command.debug(`project: ${project}`);

    if (!project) {
      return Promise.reject(new Error(`Please login using \`${config.cli} login\`.`));
    }

    let url: string;

    if (dash) {
      if (!apiKey) {
        return Promise.reject(new Error(`Please login using \`${config.cli} login\`.`));
      }

      const selectedVersion = await getProjectVersion(undefined, apiKey, true);
      const dashURL: string = config.host;
      url = `${dashURL}/project/${project}/v${selectedVersion}/overview`;
    } else {
      const hubURL: string = config.hub;
      url = hubURL.replace('{project}', project);
    }

    return (opts.mockOpen || open)(url, {
      wait: false,
    }).then(() => Promise.resolve(`Opening ${chalk.green(url)} in your browser...`));
  }
}
