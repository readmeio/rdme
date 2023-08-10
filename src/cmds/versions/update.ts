import type { Version } from '.';
import type { CommonOptions } from './create';
import type { CommandOptions } from '../../lib/baseCommand';

import { Headers } from 'node-fetch';

import Command, { CommandCategories } from '../../lib/baseCommand';
import * as promptHandler from '../../lib/prompts';
import promptTerminal from '../../lib/promptWrapper';
import readmeAPIFetch, { cleanHeaders, handleRes } from '../../lib/readmeAPIFetch';
import { getProjectVersion } from '../../lib/versionSelect';

export interface Options extends CommonOptions {
  deprecated?: 'true' | 'false';
  newVersion?: string;
}

export default class UpdateVersionCommand extends Command {
  constructor() {
    super();

    this.command = 'versions:update';
    this.usage = 'versions:update <version> [options]';
    this.description = 'Update an existing version for your project.';
    this.cmdCategory = CommandCategories.VERSIONS;

    this.hiddenArgs = ['version'];
    this.args = [
      this.getKeyArg(),
      {
        name: 'version',
        type: String,
        defaultOption: true,
      },
      {
        name: 'newVersion',
        type: String,
        description: 'What should the version be renamed to?',
      },
      ...this.getVersionOpts(),
      {
        name: 'deprecated',
        type: String,
        description: "Would you like to deprecate this version? (Must be 'true' or 'false')",
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    const { key, version, newVersion, codename, main, beta, isPublic, deprecated } = opts;

    const selectedVersion = await getProjectVersion(version, key);

    Command.debug(`selectedVersion: ${selectedVersion}`);

    const foundVersion = await readmeAPIFetch(`/api/v1/version/${selectedVersion}`, {
      method: 'get',
      headers: cleanHeaders(key),
    }).then(handleRes);

    const promptResponse = await promptTerminal(promptHandler.createVersionPrompt([], opts, foundVersion));

    const body: Version = {
      codename: codename || '',
      version: newVersion || promptResponse.newVersion,
      is_stable: foundVersion.is_stable || main === 'true' || promptResponse.is_stable,
      is_beta: beta === 'true' || promptResponse.is_beta,
      is_deprecated: deprecated === 'true' || promptResponse.is_deprecated,
      is_hidden: promptResponse.is_stable ? false : !(isPublic === 'true' || promptResponse.is_hidden),
    };

    return readmeAPIFetch(`/api/v1/version/${selectedVersion}`, {
      method: 'put',
      headers: cleanHeaders(
        key,
        new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      ),
      body: JSON.stringify(body),
    })
      .then(handleRes)
      .then(() => {
        return Promise.resolve(`Version ${selectedVersion} updated successfully.`);
      });
  }
}
