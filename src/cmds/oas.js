const { debug } = require('../lib/logger');

module.exports = class OASCommand {
  constructor() {
    this.command = 'oas';
    this.usage = 'oas';
    this.description = 'Helpful OpenAPI generation tooling. [inactive]';
    this.category = 'utilities';
    this.position = 1;

    this.args = [];
  }

  async run() {
    debug(`command: ${this.command}`);
    const message = [
      'This `oas` integration is now inactive.',
      "If you're looking to use the `oas` CLI directly, head over to https://npm.im/oas.",
      "If you're looking to create an OpenAPI definition, we recommend https://npm.im/swagger-inline",
    ];
    return Promise.reject(new Error(message.join('\n\n')));
  }
};
