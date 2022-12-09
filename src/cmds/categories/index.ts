import type { CommandOptions } from '../../lib/baseCommand';

import Command, { CommandCategories } from '../../lib/baseCommand';
import getCategories from '../../lib/getCategories';
import { getProjectVersion } from '../../lib/versionSelect';

export default class CategoriesCommand extends Command {
  constructor() {
    super();

    this.command = 'categories';
    this.usage = 'categories [options]';
    this.description = 'Get all categories in your ReadMe project.';
    this.cmdCategory = CommandCategories.CATEGORIES;

    this.args = [this.getKeyArg(), this.getVersionArg()];
  }

  async run(opts: CommandOptions<{}>) {
    await super.run(opts);

    const { key, version } = opts;

    const selectedVersion = await getProjectVersion(version, key);

    Command.debug(`selectedVersion: ${selectedVersion}`);

    const allCategories = await getCategories(key, selectedVersion);

    return Promise.resolve(JSON.stringify(allCategories, null, 2));
  }
}
