import chalk from 'chalk';
import config from 'config';
import { validate as isEmail } from 'isemail';
import { promisify } from 'util';
import configStore from '../lib/configstore';
import fetch, { handleRes } from '../lib/fetch';
import { debug } from '../lib/logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const read = promisify(require('read'));

const testing = process.env.NODE_ENV === 'testing';

type Args = {
  email?: string;
  password?: string;
  project: string;

  // Though `--2fa` and `--token` can be both be supplied via the command line we internally end
  // up using `--token` because JS variables can't start with numbers.
  '2fa'?: string;
  token?: string;
};

export default class LoginCommand implements Command {
  command = 'login';
  usage = 'login [options]';
  description = 'Login to a ReadMe project.';
  category = 'admin';
  position = 1;

  args = [
    {
      name: 'project',
      type: String,
      description: 'Project subdomain',
    },
    {
      name: '2fa',
      type: Boolean,
      description: 'Prompt for a 2FA token',
    },
  ];

  async run(opts: Args) {
    let { email, password, project, token } = opts;

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    /* istanbul ignore next */
    async function getCredentials() {
      return {
        email: await read({ prompt: 'Email:', default: configStore.get('email') }),
        password: await read({ prompt: 'Password:', silent: true }),
        project: opts.project || (await read({ prompt: 'Project subdomain:', default: configStore.get('project') })),
        token: opts['2fa'] && (await read({ prompt: '2fa token:' })),
      };
    }

    // We only want to prompt for input outside of the test environment
    /* istanbul ignore next */
    if (!testing) {
      ({ email, password, project, token } = await getCredentials());
    }

    if (!project) {
      return Promise.reject(new Error('No project subdomain provided. Please use `--project`.'));
    }

    if (!isEmail(email)) {
      return Promise.reject(new Error('You must provide a valid email address.'));
    }

    return fetch(`${config.get('host')}/api/v1/login`, {
      method: 'post',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        project,
        token,
      }),
    })
      .then(handleRes)
      .then((res: Record<string, unknown>) => {
        configStore.set('apiKey', res.apiKey);
        configStore.set('email', email);
        configStore.set('project', project);

        return `Successfully logged in as ${chalk.green(email)} to the ${chalk.blue(project)} project.`;
      });
  }
}
