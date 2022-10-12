import type { CommandOptions } from '../../lib/baseCommand';

import config from 'config';

import Command, { CommandCategories } from '../../lib/baseCommand';
import fetch, { cleanHeaders, handleRes } from '../../lib/fetch';
import { getProjectVersion } from '../../lib/versionSelect';

export default class DeleteVersionCommand extends Command {
  constructor() {
    super();

    this.command = 'versions:delete';
    this.usage = 'versions:delete <version> [options]';
    this.description = 'Delete a version associated with your ReadMe project.';
    this.cmdCategory = CommandCategories.VERSIONS;
    this.position = 4;

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

  async run(opts: CommandOptions<{}>) {
    super.run(opts);

    const { key, version } = opts;

    const selectedVersion = await getProjectVersion(version, key);

    Command.debug(`selectedVersion: ${selectedVersion}`);

    return fetch(`${config.get('host')}/api/v1/version/${selectedVersion}`, {
      method: 'delete',
      headers: cleanHeaders(key),
    })
      .then(handleRes)
      .then(() => {
        return Promise.resolve(`Version ${selectedVersion} deleted successfully.`);
      });
  }
}
