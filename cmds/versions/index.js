const request = require('request-promise-native');
const Table = require('cli-table');
const config = require('config');
const versionsCreate = require('./create');

exports.command = 'versions';
exports.usage = 'versions [options]';
exports.description =
  'List versions available in your project or get a version by SemVer (https://semver.org/).';
exports.category = 'versions';
exports.position = 1;

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
  {
    name: 'raw',
    type: Boolean,
    description: 'Return raw output from the API instead of in a "pretty" format.',
  },
];

const getVersionsAsTable = versions => {
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
      v.codename || 'None',
      v.is_deprecated ? 'no' : 'yes',
      v.is_hidden ? 'no' : 'yes',
      v.is_beta ? 'no' : 'yes',
      v.is_stable ? 'no' : 'yes',
      v.createdAt,
    ]);
  });

  return table.toString();
};

const getVersionFormatted = version => {
  const output = [
    `${'Version:'.bold} ${version.version}`,
    `${'Codename:'.bold} ${version.codename || 'None'}`,
    `${'Created on:'.bold} ${version.createdAt}`,
    `${'Released on:'.bold} ${version.releaseDate}`,
  ];

  const table = new Table({
    head: ['Is deprecated'.bold, 'Is hidden'.bold, 'Is beta'.bold, 'Is stable'.bold],
  });

  table.push([
    version.is_deprecated ? 'no' : 'yes',
    version.is_hidden ? 'no' : 'yes',
    version.is_beta ? 'no' : 'yes',
    version.is_stable ? 'no' : 'yes',
  ]);

  output.push(table.toString());

  return output.join('\n');
};

exports.run = function(opts) {
  const { key, version, raw } = opts;

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
      if (raw) {
        return Promise.resolve(data);
      }

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

      if (version === undefined) {
        return Promise.resolve(getVersionsAsTable(versions));
      }

      return Promise.resolve(getVersionFormatted(versions[0]));
    });
};
