import { Args } from '@oclif/core';

import BaseCommand from '../../lib/baseCommand.js';
import { keyFlag } from '../../lib/flags.js';
import { cleanAPIv1Headers, handleAPIv1Res, readmeAPIv1Fetch } from '../../lib/readmeAPIFetch.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

export default class DeleteVersionCommand extends BaseCommand<typeof DeleteVersionCommand> {
  // needed for deprecation message
  static id = 'versions delete' as const;

  static state = 'deprecated';

  static deprecationOptions = {
    message: `\`rdme ${this.id}\` is deprecated and will be removed in v10.\n\nFor more information, please visit our migration guide: https://github.com/readmeio/rdme/blob/v10/documentation/migration-guide.md#migrating-to-rdme9`,
  };

  static description = 'Delete a version associated with your ReadMe project.';

  static args = {
    version: Args.string({
      description: "The version you'd like to delete.",
    }),
  };

  static flags = {
    key: keyFlag,
  };

  static examples = [
    {
      description: 'Remove a specific version from your project, as well as all of the associated documentation:',
      command: '<%= config.bin %> <%= command.id %> <version>',
    },
  ];

  async run() {
    const { version } = this.args;
    const { key } = this.flags;

    const selectedVersion = await getProjectVersion(version, key);

    this.debug(`selectedVersion: ${selectedVersion}`);

    return readmeAPIv1Fetch(`/api/v1/version/${selectedVersion}`, {
      method: 'delete',
      headers: cleanAPIv1Headers(key),
    })
      .then(handleAPIv1Res)
      .then(() => {
        return Promise.resolve(`Version ${selectedVersion} deleted successfully.`);
      });
  }
}
