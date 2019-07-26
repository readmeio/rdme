const request = require('request-promise-native');
const Table = require('cli-table');
const config = require('config');
const versionsCreate = require('./create');

exports.command = 'versions';
exports.usage = 'versions [options]';
exports.description =
  'List versions available in your project or get a version by SemVer (https://semver.org/).';
exports.category = 'versions';
exports.weight = 3;

exports.args = [
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
];

exports.run = function(opts) {
  const { key, version } = opts;

  if (!key) {
    return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
  }

  const uri = version
    ? `${config.host}/api/v1/version/${version}`
    : `${config.host}/api/v1/version`;

  return request
    .get(uri, {
      json: true,
      auth: { user: key },
    })
    .then(data => {
      let versions = data;
      if (!Array.isArray(data)) {
        versions = [data];
      }

      if (!versions.length) {
        return Promise.reject(
          new Error(
            `Sorry, you haven't created any versions yet! See \`${config.cli} help ${versionsCreate.command}\` for commands on how to do that.`,
          ),
        );
      }

      const table = new Table({
        head: [
          'Version'.bold,
          'Codename'.bold,
          'Is deprecated'.bold,
          'Is hidden'.bold,
          'Is beta'.bold,
          'Is stable'.bold,
          'Created on'.bold,
        ],
      });

      versions.forEach(v => {
        table.push([
          v.version,
          v.codename,
          v.is_deprecated ? 'no' : 'yes',
          v.is_hidden ? 'no' : 'yes',
          v.is_beta ? 'no' : 'yes',
          v.is_stable ? 'no' : 'yes',
          v.createdAt,
        ]);
      });

      return Promise.resolve(table.toString());
    });
};
