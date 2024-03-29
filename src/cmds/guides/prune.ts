import type { AuthenticatedCommandOptions } from '../../lib/baseCommand.js';
import type { Options } from '../docs/prune.js';

import DocsPruneCommand from '../docs/prune.js';

export default class GuidesPruneCommand extends DocsPruneCommand {
  constructor() {
    super();

    this.command = 'guides:prune';
    this.usage = 'guides:prune <folder> [options]';
    this.description = 'Alias for `rdme docs:prune`.';
  }

  async run(opts: AuthenticatedCommandOptions<Options>) {
    return super.run(opts);
  }
}
