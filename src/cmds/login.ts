import { Flags } from '@oclif/core';
import prompts from 'prompts';

import BaseCommand from '../lib/baseCommandNew.js';
import loginFlow from '../lib/loginFlow.js';

export default class LoginCommand extends BaseCommand {
  static description = 'Login to a ReadMe project.';

  static flags = {
    email: Flags.string({ description: 'Your email address' }),
    password: Flags.string({ description: 'Your password' }),
    otp: Flags.string({ description: 'Your one-time password (if you have two-factor authentication enabled)' }),
    project: Flags.string({ description: 'The subdomain of the project you wish to log into' }),
  };

  async run() {
    const { flags } = await this.parse(LoginCommand);

    prompts.override(flags);

    return loginFlow(flags.otp);
  }
}
