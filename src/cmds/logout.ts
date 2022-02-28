import config from 'config';
import configStore from '../lib/configstore';
import { debug } from '../lib/logger';

export default class LogoutCommand implements Command {
  command = 'logout';
  usage = 'logout';
  description = 'Logs the currently authenticated user out of ReadMe.';
  category = 'admin';
  position = 2;

  async run() {
    debug(`command: ${this.command}`);

    if (configStore.has('email') && configStore.has('project')) {
      configStore.clear();
    }

    return Promise.resolve(`You have logged out of ReadMe. Please use \`${config.get('cli')} login\` to login again.`);
  }
}
