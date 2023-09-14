import type { AuthenticatedCommandOptions } from '../../lib/baseCommand.js';

import Command, { CommandCategories } from '../../lib/baseCommand.js';
import getCategories from '../../lib/getCategories.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

export default class CategoriesCommand extends Command {
  constructor() {
    super();

    this.command = 'categories';
    this.usage = 'categories [options]';
    this.description = 'Get all categories in your ReadMe project.';
    this.cmdCategory = CommandCategories.CATEGORIES;

    this.args = [this.getKeyArg(), this.getVersionArg()];
  }

  async run(opts: AuthenticatedCommandOptions) {
    await super.run(opts);

    const { key, version } = opts;

    const selectedVersion = await getProjectVersion(version, key);

    Command.debug(`selectedVersion: ${selectedVersion}`);

    const allCategories = await getCategories(key, selectedVersion);

    return Promise.resolve(JSON.stringify(allCategories, null, 2));
  }
}
