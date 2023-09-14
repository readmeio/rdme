import type { Options } from './openapi/validate.js';
import type { ZeroAuthCommandOptions } from '../lib/baseCommand.js';

import Command from '../lib/baseCommand.js';
import isHidden from '../lib/decorators/isHidden.js';

import OpenAPIValidateCommand from './openapi/validate.js';

@isHidden
export default class ValidateAliasCommand extends OpenAPIValidateCommand {
  constructor() {
    super();

    this.command = 'validate';
    this.usage = 'validate [file] [options]';
    this.description = 'Alias for `rdme openapi:validate` [deprecated].';
  }

  async run(opts: ZeroAuthCommandOptions<Options>) {
    Command.warn('`rdme validate` has been deprecated. Please use `rdme openapi:validate` instead.');
    return super.run(opts);
  }
}
