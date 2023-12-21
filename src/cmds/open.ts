import { Flags } from '@oclif/core';
import chalk from 'chalk';
import open from 'open';

import BaseCommand from '../lib/baseCommandNew.js';
import config from '../lib/config.js';
import getCurrentConfig from '../lib/getCurrentConfig.js';
import { getProjectVersion } from '../lib/versionSelect.js';

export default class OpenCommand extends BaseCommand {
  static description = 'Open your current ReadMe project in the browser.';

  static flags = {
    dash: Flags.boolean({ description: 'Opens your current ReadMe project dashboard.' }),
    mock: Flags.boolean({ description: '[hidden] used for mocking.', hidden: true }),
  };

  async run() {
    const {
      flags: { dash, mock },
    } = await this.parse(OpenCommand);
    const { apiKey, project } = getCurrentConfig();
    this.debug(`project: ${project}`);

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

    const result = `Opening ${chalk.green(url)} in your browser...`;

    if (mock) {
      return Promise.resolve(result);
    }

    return open(url, {
      wait: false,
    }).then(() => Promise.resolve(result));
  }
}
