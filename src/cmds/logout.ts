import BaseCommand from '../lib/baseCommandNew.js';
import configStore from '../lib/configstore.js';

export default class LogoutCommand extends BaseCommand<typeof LogoutCommand> {
  static description = 'Logs the currently authenticated user out of ReadMe.';

  async run() {
    if (configStore.has('email') && configStore.has('project')) {
      configStore.clear();
    }

    return Promise.resolve(`You have logged out of ReadMe. Please use \`${this.config.bin} login\` to login again.`);
  }
}
