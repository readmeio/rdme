const config = require('config');
const configStore = require('../lib/configstore');
const { debug } = require('../lib/logger');

module.exports = class LogoutCommand {
  constructor() {
    this.command = 'logout';
    this.usage = 'logout';
    this.description = 'Logs the currently authenticated user out of ReadMe.';
    this.category = 'admin';
    this.position = 2;

    this.args = [];
  }

  async run() {
    debug(`command: ${this.command}`);

    if (configStore.has('email') && configStore.has('project')) {
      configStore.clear();
    }

    return Promise.resolve(`You have logged out of ReadMe. Please use \`${config.get('cli')} login\` to login again.`);
  }
};
