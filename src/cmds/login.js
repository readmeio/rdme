const chalk = require('chalk');
const config = require('config');
const { validate: isEmail } = require('isemail');
const { promisify } = require('util');
const read = promisify(require('read'));
const configStore = require('../lib/configstore');
const fetch = require('../lib/fetch');
const { handleRes } = require('../lib/fetch');
const { debug } = require('../lib/logger');

const testing = process.env.NODE_ENV === 'testing';

module.exports = class LoginCommand {
  constructor() {
    this.command = 'login';
    this.usage = 'login [options]';
    this.description = 'Login to a ReadMe project.';
    this.category = 'admin';
    this.position = 1;

    this.args = [
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
  }

  async run(opts) {
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
      .then(res => {
        configStore.set('apiKey', res.apiKey);
        configStore.set('email', email);
        configStore.set('project', project);

        return `Successfully logged in as ${chalk.green(email)} to the ${chalk.blue(project)} project.`;
      });
  }
};
