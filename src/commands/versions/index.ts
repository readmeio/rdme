import { Flags } from '@oclif/core';

import BaseCommand from '../../lib/baseCommand.js';
import { keyFlag } from '../../lib/flags.js';
import { cleanAPIv1Headers, handleAPIv1Res, readmeAPIv1Fetch } from '../../lib/readmeAPIFetch.js';

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

export default class VersionsCommand extends BaseCommand<typeof VersionsCommand> {
  static description = 'List versions available in your project or get a version by SemVer (https://semver.org/).';

  static flags = {
    key: keyFlag,
    version: Flags.string({ description: 'A specific project version to view.' }),
  };

  async run() {
    const { key, version } = this.flags;

    const uri = version ? `/api/v1/version/${version}` : '/api/v1/version';

    return readmeAPIv1Fetch(uri, {
      method: 'get',
      headers: cleanAPIv1Headers(key),
    })
      .then(handleAPIv1Res)
      .then(data => Promise.resolve(JSON.stringify(data, null, 2)));
  }
}
