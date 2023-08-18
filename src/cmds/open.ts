import type { CommandOptions } from '../lib/baseCommand';

import chalk from 'chalk';
import config from 'config';
import open from 'open';

import Command, { CommandCategories } from '../lib/baseCommand';
import getCurrentConfig from '../lib/getCurrentConfig';
import { getProjectVersion } from '../lib/versionSelect';

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
      return Promise.reject(new Error(`Please login using \`${config.get('cli')} login\`.`));
    }

    let url: string;

    if (dash) {
      if (!apiKey) {
        return Promise.reject(new Error(`Please login using \`${config.get('cli')} login\`.`));
      }

      const selectedVersion = await getProjectVersion(undefined, apiKey, true);
      const dashURL: string = config.get('host');
      url = `${dashURL}/project/${project}/v${selectedVersion}/overview`;
    } else {
      const hubURL: string = config.get('hub');
      url = hubURL.replace('{project}', project);
    }

    return (opts.mockOpen || open)(url, {
      wait: false,
    }).then(() => Promise.resolve(`Opening ${chalk.green(url)} in your browser...`));
  }
}
