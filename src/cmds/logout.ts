import BaseCommand from '../lib/baseCommandNew.js';
import config from '../lib/config.js';
import configStore from '../lib/configstore.js';

export default class LogoutCommand extends BaseCommand {
  static description = 'Logs the currently authenticated user out of ReadMe.';

  async run() {
    if (configStore.has('email') && configStore.has('project')) {
      configStore.clear();
    }

    return Promise.resolve(`You have logged out of ReadMe. Please use \`${config.cli} login\` to login again.`);
  }
}
