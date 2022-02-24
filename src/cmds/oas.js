const chalk = require('chalk');

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
    const message = [
      'This `oas` integration is now inactive.',
      "If you're looking to use the `oas` CLI directly, head over to https://npm.im/oas.",
    ];
    return Promise.resolve(chalk.red(message.join('\n\n')));
  }
};
