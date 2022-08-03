import { debug } from '../../lib/logger.js';
import { getProjectVersion } from '../../lib/versionSelect.js';
import getCategories from '../../lib/getCategories.js';

export default class CategoriesCommand {
  constructor() {
    this.command = 'categories';
    this.usage = 'categories [options]';
    this.description = 'Get all categories in your ReadMe project';
    this.cmdCategory = 'categories';
    this.position = 1;

    this.args = [
      {
        name: 'key',
        type: String,
        description: 'Project API key',
      },
      {
        name: 'version',
        type: String,
        description: 'Project version',
      },
    ];
  }

  async run(opts) {
    const { key, version } = opts;

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }
    const selectedVersion = await getProjectVersion(version, key, true);

    debug(`selectedVersion: ${selectedVersion}`);

    const allCategories = await getCategories(key, selectedVersion);

    return Promise.resolve(JSON.stringify(allCategories, null, 2));
  }
}
