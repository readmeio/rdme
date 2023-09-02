import type { CommonOptions } from './create.js';
import type { Version } from './index.js';
import type { CommandOptions } from '../../lib/baseCommand.js';

import { Headers } from 'node-fetch';
import prompts from 'prompts';

import Command, { CommandCategories } from '../../lib/baseCommand.js';
import castStringOptToBool from '../../lib/castStringOptToBool.js';
import * as promptHandler from '../../lib/prompts.js';
import promptTerminal from '../../lib/promptWrapper.js';
import readmeAPIFetch, { cleanHeaders, handleRes } from '../../lib/readmeAPIFetch.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

export interface Options extends CommonOptions {
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
        name: 'newVersion',
        type: String,
        description: 'What should the version be renamed to?',
      },
      ...this.getVersionOpts(),
    ];
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    const { key, version, newVersion, codename, main, beta, isPublic, deprecated } = opts;

    const selectedVersion = await getProjectVersion(version, key);

    Command.debug(`selectedVersion: ${selectedVersion}`);

    // TODO: I think this fetch here is unnecessary but
    // it will require a bigger refactor of getProjectVersion
    const foundVersion = await readmeAPIFetch(`/api/v1/version/${selectedVersion}`, {
      method: 'get',
      headers: cleanHeaders(key),
    }).then(handleRes);

    prompts.override({
      is_beta: castStringOptToBool(beta, 'beta'),
      is_deprecated: castStringOptToBool(deprecated, 'deprecated'),
      is_public: castStringOptToBool(isPublic, 'isPublic'),
      is_stable: castStringOptToBool(main, 'main'),
      newVersion,
    });

    const promptResponse = await promptTerminal(promptHandler.versionPrompt([], foundVersion));

    const body: Version = {
      codename,
      // fall back to current version if user didn't enter one
      version: promptResponse.newVersion || version,
      is_beta: promptResponse.is_beta,
      is_deprecated: promptResponse.is_deprecated,
      // if the "is public" question was never asked, we should omit that from the payload
      is_hidden: typeof promptResponse.is_public === 'undefined' ? undefined : !promptResponse.is_public,
      is_stable: promptResponse.is_stable,
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
