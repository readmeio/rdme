import type { CommandOptions } from '../../lib/baseCommand';

import config from 'config';

import Command, { CommandCategories } from '../../lib/baseCommand';
import fetch, { cleanHeaders, handleRes } from '../../lib/fetch';

export interface Version {
  codename?: string;
  createdAt: string;
  is_beta: boolean;
  is_deprecated: boolean;
  is_hidden: boolean;
  is_stable: boolean;
  version: string;
}

export default class VersionsCommand extends Command {
  constructor() {
    super();

    this.command = 'versions';
    this.usage = 'versions [options]';
    this.description = 'List versions available in your project or get a version by SemVer (https://semver.org/).';
    this.cmdCategory = CommandCategories.VERSIONS;
    this.position = 1;

    this.args = [
      this.getKeyArg(),
      {
        name: 'version',
        type: String,
        description: 'A specific project version to view.',
      },
    ];
  }

  async run(opts: CommandOptions<{}>) {
    super.run(opts);

    const { key, version } = opts;

    const uri = version ? `${config.get('host')}/api/v1/version/${version}` : `${config.get('host')}/api/v1/version`;

    return fetch(uri, {
      method: 'get',
      headers: cleanHeaders(key),
    })
      .then(handleRes)
      .then(data => Promise.resolve(JSON.stringify(data, null, 2)));
  }
}
