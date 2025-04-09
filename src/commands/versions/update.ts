import type { Version } from './index.js';

import { Args, Flags } from '@oclif/core';
import prompts from 'prompts';

import BaseCommand from '../../lib/baseCommand.js';
import castStringOptToBool from '../../lib/castStringOptToBool.js';
import { baseVersionFlags, keyFlag } from '../../lib/flags.js';
import * as promptHandler from '../../lib/prompts.js';
import promptTerminal from '../../lib/promptWrapper.js';
import { cleanAPIv1Headers, handleAPIv1Res, readmeAPIv1Fetch } from '../../lib/readmeAPIFetch.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

export default class UpdateVersionCommand extends BaseCommand<typeof UpdateVersionCommand> {
  // needed for deprecation message
  static id = 'versions update' as const;

  static state = 'deprecated';

  static deprecationOptions = {
    message: `\`rdme ${this.id}\` is deprecated and will be removed in v10.\n\nFor more information, please visit our migration guide: https://github.com/readmeio/rdme/blob/v10/documentation/migration-guide.md#migrating-to-rdme9`,
  };

  static description = 'Update an existing version for your project.';

  static args = {
    version: Args.string({ description: "The existing version you'd like to update." }),
  };

  static flags = {
    newVersion: Flags.string({ description: 'What should the version be renamed to?' }),
    key: keyFlag,
    ...baseVersionFlags,
  };

  static examples = [
    {
      description: 'Update an existing version (with no flags):',
      command: '<%= config.bin %> <%= command.id %>',
    },
    {
      description:
        'If you wish to automate the process of updating a project version, and not have the CLI prompt you for input, you can do so by supplying the necessary flags:',
      command:
        '<%= config.bin %> <%= command.id %> <version> --newVersion={new-version-name} --main={true|false} --beta={true|false} --deprecated={true|false} --hidden={true|false}',
    },
  ];

  async run() {
    const { version } = this.args;
    const { key, newVersion, codename, main, beta, hidden, deprecated } = this.flags;

    const selectedVersion = await getProjectVersion(version, key);

    this.debug(`selectedVersion: ${selectedVersion}`);

    // TODO: I think this fetch here is unnecessary but
    // it will require a bigger refactor of getProjectVersion
    const foundVersion: Version = await readmeAPIv1Fetch(`/api/v1/version/${selectedVersion}`, {
      method: 'get',
      headers: cleanAPIv1Headers(key),
    }).then(handleAPIv1Res);

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
      version: promptResponse.newVersion || selectedVersion,
      is_beta: promptResponse.is_beta,
      is_deprecated: promptResponse.is_deprecated,
      is_hidden: promptResponse.is_hidden,
      is_stable: promptResponse.is_stable,
    };

    return readmeAPIv1Fetch(`/api/v1/version/${selectedVersion}`, {
      method: 'put',
      headers: cleanAPIv1Headers(
        key,
        undefined,
        new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' }),
      ),
      body: JSON.stringify(body),
    })
      .then(handleAPIv1Res)
      .then(() => {
        return Promise.resolve(`Version ${selectedVersion} updated successfully.`);
      });
  }
}
