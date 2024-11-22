import BaseCommand from '../../lib/baseCommand.js';
import { keyFlag, versionFlag } from '../../lib/flags.js';
import getCategories from '../../lib/getCategories.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

export default class CategoriesCommand extends BaseCommand<typeof CategoriesCommand> {
  static description = 'Get all categories in your ReadMe project.';

  static flags = {
    key: keyFlag,
    version: versionFlag,
  };

  static examples = [
    {
      description: 'Get all categories associated to your project version:',
      command: '<%= config.bin %> <%= command.id %> --version={project-version}',
    },
  ];

  async run() {
    const { key, version } = this.flags;

    const selectedVersion = await getProjectVersion(version, key);

    this.debug(`selectedVersion: ${selectedVersion}`);

    const allCategories = await getCategories(key, selectedVersion);

    return Promise.resolve(JSON.stringify(allCategories, null, 2));
  }
}
