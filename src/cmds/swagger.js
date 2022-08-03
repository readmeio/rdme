import OpenAPICommand from './openapi.js';
import { debug, warn } from '../lib/logger.js';

export default class SwaggerCommand extends OpenAPICommand {
  constructor() {
    super();

    this.command = 'swagger';
    this.usage = 'swagger [file] [options]';
    this.description = 'Alias for `rdme openapi`. [deprecated]';
    this.position += 1;
  }

  async run(opts) {
    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    warn('`rdme swagger` has been deprecated. Please use `rdme openapi` instead.');
    return super.run(opts);
  }
}
