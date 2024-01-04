import { Args } from '@oclif/core';

import BaseCommand from '../../lib/baseCommand.js';
import { keyFlag } from '../../lib/flags.js';
import readmeAPIFetch, { cleanHeaders, handleRes } from '../../lib/readmeAPIFetch.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

export default class DeleteVersionCommand extends BaseCommand<typeof DeleteVersionCommand> {
  static description = 'Delete a version associated with your ReadMe project.';

  static args = {
    version: Args.string({
      description: "The version you'd like to delete.",
    }),
  };

  static flags = {
    key: keyFlag,
  };

  async run() {
    const { version } = this.args;
    const { key } = this.flags;

    const selectedVersion = await getProjectVersion(version, key);

    this.debug(`selectedVersion: ${selectedVersion}`);

    return readmeAPIFetch(`/api/v1/version/${selectedVersion}`, {
      method: 'delete',
      headers: cleanHeaders(key),
    })
      .then(handleRes)
      .then(() => {
        return Promise.resolve(`Version ${selectedVersion} deleted successfully.`);
      });
  }
}
