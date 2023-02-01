import type { CommandOptions } from '../../lib/baseCommand';

import Command, { CommandCategories } from '../../lib/baseCommand';
import readmeAPIFetch, { cleanHeaders, handleRes } from '../../lib/readmeAPIFetch';

export interface Version {
  codename?: string;
  createdAt?: string;
  from?: string;
  is_beta?: boolean;
  is_deprecated?: boolean;
  is_hidden?: boolean;
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
    await super.run(opts);

    const { key, version } = opts;

    const uri = version ? `/api/v1/version/${version}` : '/api/v1/version';

    return readmeAPIFetch(uri, {
      method: 'get',
      headers: cleanHeaders(key),
    })
      .then(handleRes)
      .then(data => Promise.resolve(JSON.stringify(data, null, 2)));
  }
}
