const chalk = require('chalk');
const Table = require('cli-table');
const config = require('config');
const CreateVersionCmd = require('./create');
const fetch = require('../../lib/fetch');
const { cleanHeaders, handleRes } = require('../../lib/fetch');
const { debug } = require('../../lib/logger');

module.exports = class VersionsCommand {
  constructor() {
    this.command = 'versions';
    this.usage = 'versions [options]';
    this.description = 'List versions available in your project or get a version by SemVer (https://semver.org/).';
    this.category = 'versions';
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

  static getVersionsAsTable(versions) {
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

  static getVersionFormatted(version) {
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

  async run(opts) {
    const { key, version, raw } = opts;

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

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
};
