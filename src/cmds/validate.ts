import type { Options } from './openapi/validate';
import type { CommandOptions } from '../lib/baseCommand';

import Command from '../lib/baseCommand';
import isHidden from '../lib/decorators/isHidden';

import OpenAPIValidateCommand from './openapi/validate';

@isHidden
export default class ValidateAliasCommand extends OpenAPIValidateCommand {
  constructor() {
    super();

    this.command = 'validate';
    this.usage = 'validate [file] [options]';
    this.description = 'Alias for `rdme openapi:validate` [deprecated].';
  }

  async run(opts: CommandOptions<Options>) {
    Command.warn('`rdme validate` has been deprecated. Please use `rdme openapi:validate` instead.');
    return super.run(opts);
  }
}
