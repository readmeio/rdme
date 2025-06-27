import { Flags } from '@oclif/core';
import prompts from 'prompts';

import BaseCommand from '../lib/baseCommand.js';
import loginFlow from '../lib/loginFlow.js';

export default class LoginCommand extends BaseCommand<typeof LoginCommand> {
  static description = 'Login to a ReadMe project.';

  static flags = {
    email: Flags.string({ description: 'Your email address' }),
    password: Flags.string({ description: 'Your password' }),
    project: Flags.string({ description: 'The subdomain of the project you wish to log into' }),
    otp: Flags.string({ description: 'Your one-time password (if you have two-factor authentication enabled)' }),
  };

  async run() {
    prompts.override(this.flags);

    return loginFlow(this.flags.otp);
  }
}
