import type { Version } from '.';
import type { CommandOptions } from '../../lib/baseCommand';
import type { VersionBaseOptions } from './create';

import config from 'config';
import { Headers } from 'node-fetch';

import Command, { CommandCategories } from '../../lib/baseCommand';
import fetch, { cleanHeaders, handleRes } from '../../lib/fetch';
import * as promptHandler from '../../lib/prompts';
import promptTerminal from '../../lib/promptWrapper';
import { getProjectVersion } from '../../lib/versionSelect';

export type VersionUpdateOptions = { deprecated?: 'true' | 'false'; newVersion?: string } & VersionBaseOptions;

export default class UpdateVersionCommand extends Command {
  constructor() {
    super();

    this.command = 'versions:update';
    this.usage = 'versions:update <version> [options]';
    this.description = 'Update an existing version for your project.';
    this.cmdCategory = CommandCategories.VERSIONS;
    this.position = 3;

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

  async run(opts: CommandOptions<VersionUpdateOptions>) {
    super.run(opts);

    const { key, version, newVersion, codename, main, beta, isPublic, deprecated } = opts;

    const selectedVersion = await getProjectVersion(version, key, false);

    Command.debug(`selectedVersion: ${selectedVersion}`);

    const foundVersion = await fetch(`${config.get('host')}/api/v1/version/${selectedVersion}`, {
      method: 'get',
      headers: cleanHeaders(key),
    }).then(res => handleRes(res));

    const promptResponse = await promptTerminal(promptHandler.createVersionPrompt([], opts, foundVersion));

    const body: Version = {
      codename: codename || '',
      version: newVersion || promptResponse.newVersion,
      is_stable: foundVersion.is_stable || main === 'true' || promptResponse.is_stable,
      is_beta: beta === 'true' || promptResponse.is_beta,
      is_deprecated: deprecated === 'true' || promptResponse.is_deprecated,
      is_hidden: promptResponse.is_stable ? false : !(isPublic === 'true' || promptResponse.is_hidden),
    };

    return fetch(`${config.get('host')}/api/v1/version/${selectedVersion}`, {
      method: 'put',
      headers: cleanHeaders(
        key,
        new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        })
      ),
      body: JSON.stringify(body),
    })
      .then(handleRes)
      .then(() => {
        return Promise.resolve(`Version ${selectedVersion} updated successfully.`);
      });
  }
}
