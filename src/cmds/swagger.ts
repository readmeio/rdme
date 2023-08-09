import type { Options } from './openapi/index.js';
import type { CommandOptions } from '../lib/baseCommand.js';

import Command from '../lib/baseCommand.js';
import isHidden from '../lib/decorators/isHidden.js';

import OpenAPICommand from './openapi/index.js';

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
