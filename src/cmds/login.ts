import type { ZeroAuthCommandOptions } from '../lib/baseCommand.js';

import prompts from 'prompts';

import Command, { CommandCategories } from '../lib/baseCommand.js';
import loginFlow from '../lib/loginFlow.js';

interface Options {
  email?: string;
  otp?: string;
  password?: string;
  project?: string;
}

export default class LoginCommand extends Command {
  constructor() {
    super();

    this.command = 'login';
    this.usage = 'login [options]';
    this.description = 'Login to a ReadMe project.';
    this.cmdCategory = CommandCategories.ADMIN;

    this.args = [
      {
        name: 'email',
        type: String,
        description: 'Your email address',
      },
      {
        name: 'password',
        type: String,
        description: 'Your password',
      },
      {
        name: 'otp',
        type: String,
        description: 'Your one-time password (if you have two-factor authentication enabled)',
      },
      {
        name: 'project',
        type: String,
        description: 'The subdomain of the project you wish to log into',
      },
    ];
  }

  async run(opts: ZeroAuthCommandOptions<Options>) {
    await super.run(opts);

    prompts.override(opts);

    return loginFlow(opts.otp);
  }
}
