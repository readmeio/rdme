import { Args } from '@oclif/core';
import chalk from 'chalk';

import BaseCommand from '../../lib/baseCommand.js';
import { branchFlag, keyFlag } from '../../lib/flags.js';

export default class OpenAPIDeleteCommand extends BaseCommand<typeof OpenAPIDeleteCommand> {
  static summary = 'Delete an API definition from your ReadMe project.';

  static description = 'Delete an API definition from a specified branch in your ReadMe project.';

  static args = {
    slug: Args.string({ description: 'The slug of the API definition you wish to delete.', required: true }),
  };

  static flags = {
    key: keyFlag,
    ...branchFlag(),
  };

  async run() {
    const { slug } = this.args;
    const { branch, key } = this.flags;

    // 1. Existence Check
    this.debug(`Checking if API definition "${slug}" exists on branch "${branch}"...`);
    const listResponse = await this.readmeAPIFetch(`/branches/${branch}/apis`, {
      method: 'GET',
      headers: new Headers({
        authorization: `Bearer ${key}`,
        accept: 'application/json',
      }),
    }).then(res => this.handleAPIRes<{ data: { filename: string }[] }>(res));

    const exists = listResponse.data.some(api => api.filename === slug);

    if (!exists) {
      throw new Error(
        `API definition ${chalk.red(slug)} not found on branch ${chalk.yellow(branch)}.\nAvailable APIs: ${listResponse.data
          .map(api => api.filename)
          .join(', ')}`,
      );
    }

    // 2. Deletion
    this.debug(`Deleting API definition "${slug}" from branch "${branch}"...`);
    await this.readmeAPIFetch(`/branches/${branch}/apis/${slug}`, {
      method: 'DELETE',
      headers: new Headers({
        authorization: `Bearer ${key}`,
        accept: 'application/json',
      }),
    }).then(res => this.handleAPIRes(res));

    return Promise.resolve(`Successfully deleted the ${chalk.green(slug)} API definition from branch ${chalk.yellow(branch)}!`);
  }
}
