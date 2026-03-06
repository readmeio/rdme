import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';

import BaseCommand from '../../lib/baseCommand.js';
import { keyFlag } from '../../lib/flags.js';

export default class BranchCreateCommand extends BaseCommand<typeof BranchCreateCommand> {
  static summary = 'Create a new branch in your ReadMe project.';

  static description = 'Create a new branch in your ReadMe project.';

  static args = {
    name: Args.string({ description: 'The name of the branch you wish to create.', required: true }),
  };

  static flags = {
    key: keyFlag,
    base: Flags.string({ description: 'The clean string of version we are basing off of. Defaults to the stable version.' }),
  };

  async run() {
    const { name } = this.args;
    const { base, key } = this.flags;

    let branchName = name;

    if (base) {
      const normalizedBase = base.replace(/^v/i, '');
      const versionPrefixRegex = /^([vV]?\d+(?:\.\d+)*)_/;
      const match = name.match(versionPrefixRegex);

      if (match) {
        const prefix = match[1];
        const normalizedPrefix = prefix.replace(/^v/i, '');

        if (normalizedPrefix !== normalizedBase) {
          throw new Error(
            `the branch name you provided (${chalk.red(name)}) does not match the base version you specified (${chalk.yellow(base)}).`,
          );
        }

        // It matches, so we use the name as is (already has the prefix)
      } else {
        // No version prefix, so we prepend the base
        branchName = `${base}_${name}`;
      }
    }

    const body: Record<string, string> = { name: branchName };
    if (base) {
      body.base = base;
    }

    const response = await this.readmeAPIFetch('/branches', {
      method: 'POST',
      headers: new Headers({
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      }),
      body: JSON.stringify(body),
    }).then(res => this.handleAPIRes(res));

    return Promise.resolve(`Successfully created the ${chalk.green(response.data.name)} branch!`);
  }
}
