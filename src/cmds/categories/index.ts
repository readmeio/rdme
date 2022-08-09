import type { CommandOptions } from '../../lib/baseCommand';

import Command, { CommandCategories } from '../../lib/baseCommand';
import getCategories from '../../lib/getCategories';
import { debug } from '../../lib/logger';
import { getProjectVersion } from '../../lib/versionSelect';

export default class CategoriesCommand extends Command {
  constructor() {
    super();

    this.command = 'categories';
    this.usage = 'categories [options]';
    this.description = 'Get all categories in your ReadMe project.';
    this.cmdCategory = CommandCategories.CATEGORIES;
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

  async run(opts: CommandOptions<{}>) {
    super.run(opts, true);

    const { key, version } = opts;

    const selectedVersion = await getProjectVersion(version, key, true);

    debug(`selectedVersion: ${selectedVersion}`);

    const allCategories = await getCategories(key, selectedVersion);

    return Promise.resolve(JSON.stringify(allCategories, null, 2));
  }
}
