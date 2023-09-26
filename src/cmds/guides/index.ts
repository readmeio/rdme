import type { AuthenticatedCommandOptions } from '../../lib/baseCommand.js';
import type { Options } from '../docs/index.js';

import DocsCommand from '../docs/index.js';

export default class GuidesCommand extends DocsCommand {
  constructor() {
    super();

    this.command = 'guides';
    this.usage = 'guides <path> [options]';
    this.description = 'Alias for `rdme docs`.';
  }

  async run(opts: AuthenticatedCommandOptions<Options>) {
    return super.run(opts);
  }
}
