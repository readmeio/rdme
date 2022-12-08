import type { CommandOptions } from '../../lib/baseCommand';
import type { Options } from '../docs/prune';

import DocsPruneCommand from '../docs/prune';

export default class GuidesPruneCommand extends DocsPruneCommand {
  constructor() {
    super();

    this.command = 'guides:prune';
    this.usage = 'guides:prune <folder> [options]';
    this.description = 'Alias for `rdme docs:prune`.';
  }

  async run(opts: CommandOptions<Options>) {
    return super.run(opts);
  }
}
