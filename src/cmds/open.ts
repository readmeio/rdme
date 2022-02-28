import chalk from 'chalk';
import config from 'config';
import open from 'open';
import configStore from '../lib/configstore';
import { debug } from '../lib/logger';

type Args = {
  mockOpen?: (url: string, opts: Record<string, unknown>) => PromiseLike<unknown>;
};

export default class OpenCommand implements Command {
  command = 'open';
  usage = 'open';
  description = 'Open your current ReadMe project in the browser.';
  category = 'utilities';
  position = 2;

  async run(opts?: Args) {
    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    const project = configStore.get('project');
    debug(`project: ${project}`);

    if (!project) {
      return Promise.reject(new Error(`Please login using \`${config.get('cli')} login\`.`));
    }

    const url = (config.get('hub') as string).replace('{project}', project);

    return (opts.mockOpen || open)(url, {
      wait: false,
      url: true,
    }).then(() => Promise.resolve(`Opening ${chalk.green(url)} in your browser...`));
  }
}
