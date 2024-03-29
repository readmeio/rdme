import type { AuthenticatedCommandOptions } from '../../lib/baseCommand.js';

import Command, { CommandCategories } from '../../lib/baseCommand.js';
import readmeAPIFetch, { cleanHeaders, handleRes } from '../../lib/readmeAPIFetch.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

export default class DeleteVersionCommand extends Command {
  constructor() {
    super();

    this.command = 'versions:delete';
    this.usage = 'versions:delete <version> [options]';
    this.description = 'Delete a version associated with your ReadMe project.';
    this.cmdCategory = CommandCategories.VERSIONS;

    this.hiddenArgs = ['version'];
    this.args = [
      this.getKeyArg(),
      {
        name: 'version',
        type: String,
        defaultOption: true,
      },
    ];
  }

  async run(opts: AuthenticatedCommandOptions) {
    await super.run(opts);

    const { key, version } = opts;

    const selectedVersion = await getProjectVersion(version, key);

    Command.debug(`selectedVersion: ${selectedVersion}`);

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
