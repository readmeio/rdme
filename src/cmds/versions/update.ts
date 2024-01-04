import type { Version } from './index.js';

import { Args, Flags } from '@oclif/core';
import { Headers } from 'node-fetch';
import prompts from 'prompts';

import BaseCommand from '../../lib/baseCommandNew.js';
import castStringOptToBool from '../../lib/castStringOptToBool.js';
import { baseVersionFlags, keyFlag } from '../../lib/flags.js';
import * as promptHandler from '../../lib/prompts.js';
import promptTerminal from '../../lib/promptWrapper.js';
import readmeAPIFetch, { cleanHeaders, handleRes } from '../../lib/readmeAPIFetch.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

export default class UpdateVersionCommand extends BaseCommand<typeof UpdateVersionCommand> {
  static description = 'Update an existing version for your project.';

  static args = {
    version: Args.string({ description: "The existing version you'd like to update." }),
  };

  static flags = {
    newVersion: Flags.string({ description: 'What should the version be renamed to?' }),
    key: keyFlag,
    ...baseVersionFlags,
  };

  async run() {
    const { version } = this.args;
    const { key, newVersion, codename, main, beta, hidden, deprecated } = this.flags;

    const selectedVersion = await getProjectVersion(version, key);

    this.debug(`selectedVersion: ${selectedVersion}`);

    // TODO: I think this fetch here is unnecessary but
    // it will require a bigger refactor of getProjectVersion
    const foundVersion = await readmeAPIFetch(`/api/v1/version/${selectedVersion}`, {
      method: 'get',
      headers: cleanHeaders(key),
    }).then(handleRes);

    prompts.override({
      is_beta: castStringOptToBool(beta, 'beta'),
      is_deprecated: castStringOptToBool(deprecated, 'deprecated'),
      is_hidden: castStringOptToBool(hidden, 'hidden'),
      is_stable: castStringOptToBool(main, 'main'),
      newVersion,
    });

    const promptResponse = await promptTerminal(promptHandler.versionPrompt([], foundVersion));

    const body: Version = {
      codename,
      // fallback to existing version if user was prompted to rename the version but didn't enter anything
      version: promptResponse.newVersion || version,
      is_beta: promptResponse.is_beta,
      is_deprecated: promptResponse.is_deprecated,
      is_hidden: promptResponse.is_hidden,
      is_stable: promptResponse.is_stable,
    };

    return readmeAPIFetch(`/api/v1/version/${selectedVersion}`, {
      method: 'put',
      headers: cleanHeaders(
        key,
        undefined,
        new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' }),
      ),
      body: JSON.stringify(body),
    })
      .then(handleRes)
      .then(() => {
        return Promise.resolve(`Version ${selectedVersion} updated successfully.`);
      });
  }
}
