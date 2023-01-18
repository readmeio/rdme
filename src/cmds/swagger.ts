import type { Options } from './openapi';
import type { CommandOptions } from '../lib/baseCommand';

import Command from '../lib/baseCommand';
import isHidden from '../lib/decorators/isHidden';

import OpenAPICommand from './openapi';

@isHidden
export default class SwaggerCommand extends OpenAPICommand {
  constructor() {
    super();

    this.command = 'swagger';
    this.usage = 'swagger [file] [options]';
    this.description = 'Alias for `rdme openapi`. [deprecated]';
  }

  async run(opts: CommandOptions<Options>) {
    Command.warn('`rdme swagger` has been deprecated. Please use `rdme openapi` instead.');
    return super.run(opts);
  }
}
