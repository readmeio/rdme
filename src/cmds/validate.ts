import type { CommandOptions } from '../lib/baseCommand';
import type { Options } from './openapi/validate';

import isHidden from '../lib/decorators/isHidden';

import OpenAPIValidateCommand from './openapi/validate';

@isHidden
export default class ValidateAliasCommand extends OpenAPIValidateCommand {
  constructor() {
    super();

    this.command = 'validate';
    this.usage = 'validate [file] [options]';
    this.description = 'Alias for `rdme openapi:validate`.';
    this.position = 5;
  }

  async run(opts: CommandOptions<Options>) {
    return super.run(opts);
  }
}
