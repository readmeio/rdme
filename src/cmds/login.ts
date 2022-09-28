import type { CommandOptions } from '../lib/baseCommand';

import chalk from 'chalk';
import config from 'config';
import prompts from 'prompts';
import isEmail from 'validator/lib/isEmail';

import Command, { CommandCategories } from '../lib/baseCommand';
import configStore from '../lib/configstore';
import fetch, { handleRes } from '../lib/fetch';
import { debug } from '../lib/logger';
import promptTerminal from '../lib/promptWrapper';

export type Options = {
  project?: string;
};

type LoginBody = {
  email?: string;
  password?: string;
  project?: string;
  token?: string;
};

function loginFetch(body: LoginBody) {
  return fetch(`${config.get('host')}/api/v1/login`, {
    method: 'post',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

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
    ];
  }

  async run(opts: CommandOptions<Options>) {
    super.run(opts);

    prompts.override(opts);

    const { email, password, project } = await promptTerminal([
      {
        type: 'text',
        name: 'email',
        message: 'What is your email address?',
        initial: configStore.get('email'),
        validate(val) {
          return isEmail(val) ? true : 'Please provide a valid email address.';
        },
      },
      {
        type: 'invisible',
        name: 'password',
        message: 'What is your password?',
      },
      {
        type: 'text',
        name: 'project',
        message: 'What project are you logging into?',
        initial: configStore.get('project'),
      },
    ]);

    if (!project) {
      return Promise.reject(new Error('No project subdomain provided. Please use `--project`.'));
    }

    if (!isEmail(email)) {
      return Promise.reject(new Error('You must provide a valid email address.'));
    }

    return loginFetch({ email, password, project })
      .then(handleRes)
      .catch(async err => {
        // if the user's login requires 2FA, let's prompt them for the token!
        if (err.code === 'LOGIN_TWOFACTOR') {
          debug('2FA error response, prompting for 2FA code');
          const { token } = await promptTerminal({
            type: 'text',
            name: 'token',
            message: 'What is your 2FA token?',
          });

          return loginFetch({ email, password, project, token }).then(handleRes);
        }
        throw err;
      })
      .then(res => {
        configStore.set('apiKey', res.apiKey);
        configStore.set('email', email);
        configStore.set('project', project);

        return `Successfully logged in as ${chalk.green(email)} to the ${chalk.blue(project)} project.`;
      });
  }
}
