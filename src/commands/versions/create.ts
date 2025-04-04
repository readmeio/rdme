import type { Version } from './index.js';

import { Args, Flags } from '@oclif/core';
import prompts from 'prompts';
import semver from 'semver';

import BaseCommand from '../../lib/baseCommand.js';
import castStringOptToBool from '../../lib/castStringOptToBool.js';
import { baseVersionFlags, keyFlag } from '../../lib/flags.js';
import * as promptHandler from '../../lib/prompts.js';
import promptTerminal from '../../lib/promptWrapper.js';
import { cleanAPIv1Headers, handleAPIv1Res, readmeAPIv1Fetch } from '../../lib/readmeAPIFetch.js';

export default class CreateVersionCommand extends BaseCommand<typeof CreateVersionCommand> {
  static description = 'Create a new version for your project.';

  // needed for unit tests, even though we also specify this in src/index.ts
  static id = 'versions create';

  static state = 'deprecated';

  static deprecationOptions = {
    message: `\`rdme ${this.id}\` is deprecated and will be removed in v10.\n\nFor more information, please visit our migration guide: https://github.com/readmeio/rdme/blob/v10/documentation/migration-guide.md#migrating-to-rdme9`,
  };

  static args = {
    version: Args.string({
      description: "The version you'd like to create. Must be valid SemVer (https://semver.org/)",
      required: true,
    }),
  };

  static flags = {
    fork: Flags.string({ description: "The semantic version which you'd like to fork from." }),
    key: keyFlag,
    ...baseVersionFlags,
  };

  static examples = [
    {
      description: 'Create a new version (with no flags):',
      command: '<%= config.bin %> <%= command.id %>',
    },
    {
      description:
        'If you wish to automate the process of creating a new project version, and not have the CLI prompt you for input, you can do so by supplying the necessary flags:',
      command:
        '<%= config.bin %> <%= command.id %> <version> --fork={version-fork} --main={true|false} --beta={true|false} --deprecated={true|false} --hidden={true|false}',
    },
  ];

  async run() {
    let versionList;
    const { version } = this.args;
    const { key, fork, codename, main, beta, deprecated, hidden } = this.flags;

    if (!semver.valid(semver.coerce(version))) {
      return Promise.reject(
        new Error(`Please specify a semantic version. See \`${this.config.bin} help ${this.id}\` for help.`),
      );
    }

    if (!fork) {
      versionList = await readmeAPIv1Fetch('/api/v1/version', {
        method: 'get',
        headers: cleanAPIv1Headers(key),
      }).then(handleAPIv1Res);
    }

    prompts.override({
      from: fork,
      is_beta: castStringOptToBool(beta, 'beta'),
      is_deprecated: castStringOptToBool(deprecated, 'deprecated'),
      is_hidden: castStringOptToBool(hidden, 'hidden'),
      is_stable: castStringOptToBool(main, 'main'),
    });

    const promptResponse = await promptTerminal(promptHandler.versionPrompt(versionList || []));

    const body: Version = {
      codename,
      version,
      from: promptResponse.from,
      is_beta: promptResponse.is_beta,
      is_deprecated: promptResponse.is_deprecated,
      is_hidden: promptResponse.is_hidden,
      is_stable: promptResponse.is_stable,
    };

    return readmeAPIv1Fetch('/api/v1/version', {
      method: 'post',
      headers: cleanAPIv1Headers(
        key,
        undefined,
        new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' }),
      ),
      body: JSON.stringify(body),
    })
      .then(handleAPIv1Res)
      .then(() => {
        return Promise.resolve(`Version ${version} created successfully.`);
      });
  }
}
