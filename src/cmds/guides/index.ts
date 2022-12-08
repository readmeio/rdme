import type { CommandOptions } from '../../lib/baseCommand';
import type { Options } from '../docs';

import DocsCommand from '../docs';

export default class GuidesCommand extends DocsCommand {
  constructor() {
    super();

    this.command = 'guides';
    this.usage = 'guides <path> [options]';
    this.description = 'Alias for `rdme docs`.';
  }

  async run(opts: CommandOptions<Options>) {
    return super.run(opts);
  }
}
