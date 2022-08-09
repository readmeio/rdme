import type { CommandOptions } from '../../lib/baseCommand';

import config from 'config';
import { prompt } from 'enquirer';
import { Headers } from 'node-fetch';

import Command, { CommandCategories } from '../../lib/baseCommand';
import fetch, { cleanHeaders, handleRes } from '../../lib/fetch';
import { debug } from '../../lib/logger';
import * as promptHandler from '../../lib/prompts';
import versionOpt from '../../lib/versionOpt';
import { getProjectVersion } from '../../lib/versionSelect';

export type Options = {
  beta?: string;
  codename?: string;
  deprecated?: string;
  isPublic?: string;
  main?: string;
  newVersion?: string;
};

export default class UpdateVersionCommand extends Command {
  constructor() {
    super();

    this.command = 'versions:update';
    this.usage = 'versions:update --version=<version> [options]';
    this.description = 'Update an existing version for your project.';
    this.cmdCategory = CommandCategories.VERSIONS;
    this.position = 3;

    this.args = [
      {
        name: 'key',
        type: String,
        description: 'Project API key',
      },
      versionOpt,
      {
        name: 'codename',
        type: String,
        description: 'The codename, or nickname, for a particular version.',
      },
      {
        name: 'main',
        type: String,
        description: 'Should this version be the primary (default) version for your project?',
      },
      {
        name: 'beta',
        type: String,
        description: 'Is this version in beta?',
      },
      {
        name: 'isPublic',
        type: String,
        description: 'Would you like to make this version public? Any primary version must be public.',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    super.run(opts);

    const { key, version, codename, newVersion, main, beta, isPublic, deprecated } = opts;

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    const selectedVersion = await getProjectVersion(version, key, false).catch(e => {
      return Promise.reject(e);
    });

    debug(`selectedVersion: ${selectedVersion}`);

    const foundVersion = await fetch(`${config.get('host')}/api/v1/version/${selectedVersion}`, {
      method: 'get',
      headers: cleanHeaders(key),
    }).then(res => handleRes(res));

    const promptResponse: {
      is_beta: string;
      is_deprecated: string;
      is_hidden: string;
      is_stable: string;
      newVersion: string;
    } = await prompt(
      // @ts-expect-error Seems like our version prompts aren't what Enquirer actually expects.
      promptHandler.createVersionPrompt([{}], opts, foundVersion)
    );

    return fetch(`${config.get('host')}/api/v1/version/${selectedVersion}`, {
      method: 'put',
      headers: cleanHeaders(
        key,
        new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        })
      ),
      body: JSON.stringify({
        codename: codename || '',
        version: newVersion || promptResponse.newVersion,
        is_stable: foundVersion.is_stable || main === 'true' || promptResponse.is_stable,
        is_beta: beta === 'true' || promptResponse.is_beta,
        is_deprecated: deprecated || promptResponse.is_deprecated,
        is_hidden: promptResponse.is_stable ? false : !(isPublic === 'true' || promptResponse.is_hidden),
      }),
    })
      .then(handleRes)
      .then(() => {
        return Promise.resolve(`Version ${selectedVersion} updated successfully.`);
      });
  }
}
