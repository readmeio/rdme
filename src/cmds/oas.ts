import type { CommandOptions } from '../lib/baseCommand';

import Command, { CommandCategories } from '../lib/baseCommand';
import isHidden from '../lib/decorators/isHidden';

@isHidden
export default class OASCommand extends Command {
  constructor() {
    super();

    this.command = 'oas';
    this.usage = 'oas';
    this.description = 'Helpful OpenAPI generation tooling. [inactive]';
    this.cmdCategory = CommandCategories.UTILITIES;

    this.args = [];
  }

  async run(opts: CommandOptions<{}>) {
    await super.run(opts);

    const message = [
      'This `oas` integration is now inactive.',
      "If you're looking to create an OpenAPI definition, we recommend https://npm.im/swagger-inline",
    ];

    return Promise.reject(new Error(message.join('\n\n')));
  }
}
