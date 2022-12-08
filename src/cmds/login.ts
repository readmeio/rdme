import type { CommandOptions } from '../lib/baseCommand';

import prompts from 'prompts';

import Command, { CommandCategories } from '../lib/baseCommand';
import loginFlow from '../lib/loginFlow';

export type Options = {
  project?: string;
};

export default class LoginCommand extends Command {
  constructor() {
    super();

    this.command = 'login';
    this.usage = 'login [options]';
    this.description = 'Login to a ReadMe project.';
    this.cmdCategory = CommandCategories.ADMIN;

    this.args = [
      {
        name: 'project',
        type: String,
        description: 'Project subdomain',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    prompts.override(opts);

    return loginFlow();
  }
}
