import type { CommandOptions } from '../../lib/baseCommand';

import chalk from 'chalk';
import Table from 'cli-table';
import config from 'config';

import Command, { CommandCategories } from '../../lib/baseCommand';
import fetch, { cleanHeaders, handleRes } from '../../lib/fetch';

import CreateVersionCmd from './create';

interface Version {
  codename?: string;
  createdAt: string;
  is_beta: boolean;
  is_deprecated: boolean;
  is_hidden: boolean;
  is_stable: boolean;
  releaseDate: string;
  version: string;
}

export type Options = {
  raw?: boolean;
};

export default class VersionsCommand extends Command {
  constructor() {
    super();

    this.command = 'versions';
    this.usage = 'versions [options]';
    this.description = 'List versions available in your project or get a version by SemVer (https://semver.org/).';
    this.cmdCategory = CommandCategories.VERSIONS;
    this.position = 1;

    this.args = [
      {
        name: 'key',
        type: String,
        description: 'Project API key',
      },
      {
        name: 'version',
        type: String,
        description: 'A specific project version to view',
      },
      {
        name: 'raw',
        type: Boolean,
        description: 'Return raw output from the API instead of in a "pretty" format.',
      },
    ];
  }

  static getVersionsAsTable(versions: Version[]) {
    const table = new Table({
      head: [
        chalk.bold('Version'),
        chalk.bold('Codename'),
        chalk.bold('Is deprecated'),
        chalk.bold('Is hidden'),
        chalk.bold('Is beta'),
        chalk.bold('Is stable'),
        chalk.bold('Created on'),
      ],
    });

    versions.forEach(v => {
      table.push([
        v.version,
        v.codename || 'None',
        v.is_deprecated ? 'yes' : 'no',
        v.is_hidden ? 'yes' : 'no',
        v.is_beta ? 'yes' : 'no',
        v.is_stable ? 'yes' : 'no',
        v.createdAt,
      ]);
    });

    return table.toString();
  }

  static getVersionFormatted(version: Version) {
    const output = [
      `${chalk.bold('Version:')} ${version.version}`,
      `${chalk.bold('Codename:')} ${version.codename || 'None'}`,
      `${chalk.bold('Created on:')} ${version.createdAt}`,
      `${chalk.bold('Released on:')} ${version.releaseDate}`,
    ];

    const table = new Table({
      head: [chalk.bold('Is deprecated'), chalk.bold('Is hidden'), chalk.bold('Is beta'), chalk.bold('Is stable')],
    });

    table.push([
      version.is_deprecated ? 'yes' : 'no',
      version.is_hidden ? 'yes' : 'no',
      version.is_beta ? 'yes' : 'no',
      version.is_stable ? 'yes' : 'no',
    ]);

    output.push(table.toString());

    return output.join('\n');
  }

  async run(opts: CommandOptions<Options>) {
    super.run(opts);

    const { key, version, raw } = opts;

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    const uri = version ? `${config.get('host')}/api/v1/version/${version}` : `${config.get('host')}/api/v1/version`;

    return fetch(uri, {
      method: 'get',
      headers: cleanHeaders(key),
    })
      .then(handleRes)
      .then(data => {
        if (raw) {
          return Promise.resolve(JSON.stringify(data, null, 2));
        }

        let versions = data;
        if (!Array.isArray(data)) {
          versions = [data];
        }

        if (!versions.length) {
          return Promise.reject(
            new Error(
              `Sorry, you haven't created any versions yet! See \`${config.get('cli')} help ${
                new CreateVersionCmd().command
              }\` for commands on how to do that.`
            )
          );
        }

        if (version === undefined) {
          return Promise.resolve(VersionsCommand.getVersionsAsTable(versions));
        }

        return Promise.resolve(VersionsCommand.getVersionFormatted(versions[0]));
      });
  }
}
