import type { CommandOptions } from '../lib/baseCommand';

import { promisify } from 'util';

import chalk from 'chalk';
import config from 'config';
import { validate as isEmail } from 'isemail';
import readPkg from 'read';

import Command, { CommandCategories } from '../lib/baseCommand';
import configStore from '../lib/configstore';
import fetch, { handleRes } from '../lib/fetch';

const read = promisify(readPkg);

const testing = process.env.NODE_ENV === 'testing';

export type Options = {
  '2fa'?: string;
  email?: string;
  password?: string;
  project?: string;
  token?: string;
};

export default class LoginCommand extends Command {
  constructor() {
    super();

    this.command = 'login';
    this.usage = 'login [options]';
    this.description = 'Login to a ReadMe project.';
    this.cmdCategory = CommandCategories.ADMIN;
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

  async run(opts: CommandOptions<Options>) {
    super.run(opts);

    let { email, password, project, token } = opts;

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
}
