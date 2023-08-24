import type { Version } from '.';
import type { CommandOptions } from '../../lib/baseCommand';

import config from 'config';
import { Headers } from 'node-fetch';
import prompts from 'prompts';
import semver from 'semver';

import Command, { CommandCategories } from '../../lib/baseCommand';
import castStringOptToBool from '../../lib/castStringOptToBool';
import * as promptHandler from '../../lib/prompts';
import promptTerminal from '../../lib/promptWrapper';
import readmeAPIFetch, { cleanHeaders, handleRes } from '../../lib/readmeAPIFetch';

export interface Options extends CommonOptions {
  fork?: string;
}

export interface CommonOptions {
  beta?: 'true' | 'false';
  codename?: string;
  deprecated?: 'true' | 'false';
  isPublic?: 'true' | 'false';
  main?: 'true' | 'false';
}

export default class CreateVersionCommand extends Command {
  constructor() {
    super();

    this.command = 'versions:create';
    this.usage = 'versions:create <version> [options]';
    this.description = 'Create a new version for your project.';
    this.cmdCategory = CommandCategories.VERSIONS;

    this.hiddenArgs = ['version'];
    this.args = [
      this.getKeyArg(),
      {
        name: 'fork',
        type: String,
        description: "The semantic version which you'd like to fork from.",
      },
      ...this.getVersionOpts(),
    ];
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    let versionList;
    const { key, version, fork, codename, main, beta, deprecated, isPublic } = opts;

    if (!version || !semver.valid(semver.coerce(version))) {
      return Promise.reject(
        new Error(`Please specify a semantic version. See \`${config.get('cli')} help ${this.command}\` for help.`),
      );
    }

    if (!fork) {
      versionList = await readmeAPIFetch('/api/v1/version', {
        method: 'get',
        headers: cleanHeaders(key),
      }).then(handleRes);
    }

    const versionPrompt = promptHandler.versionPrompt(versionList || []);

    prompts.override({
      from: fork,
      is_beta: castStringOptToBool(beta, 'beta'),
      is_deprecated: castStringOptToBool(deprecated, 'deprecated'),
      is_public: castStringOptToBool(isPublic, 'isPublic'),
      is_stable: castStringOptToBool(main, 'main'),
    });

    const promptResponse = await promptTerminal(versionPrompt);

    const body: Version = {
      codename,
      version,
      from: promptResponse.from,
      is_beta: promptResponse.is_beta,
      is_deprecated: promptResponse.is_deprecated,
      // if the "is public" question was never asked, we should omit that from the payload
      is_hidden: typeof promptResponse.is_public === 'undefined' ? undefined : !promptResponse.is_public,
      is_stable: promptResponse.is_stable,
    };

    return readmeAPIFetch('/api/v1/version', {
      method: 'post',
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
        return Promise.resolve(`Version ${version} created successfully.`);
      });
  }
}
