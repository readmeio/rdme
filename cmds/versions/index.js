const request = require('request-promise-native');
const Table = require('table-layout');
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

      const tableData = [
        {
          col1: 'Version'.bold,
          col2: 'Codename'.bold,
          col4: 'Is deprecated'.bold,
          col5: 'Is hidden'.bold,
          col6: 'Is beta'.bold,
          col7: 'Is stable'.bold,
          col3: 'Created on'.bold,
        },
        {
          col1: '-------',
          col2: '-------',
          col3: '-------',
          col4: '-------',
          col5: '-------',
          col6: '-------',
          col7: '-------',
        },
      ];

      versions.forEach(v => {
        tableData.push({
          col1: v.version,
          col2: v.codename,
          col3: v.is_deprecated,
          col4: v.is_hidden,
          col5: v.is_beta,
          col6: v.is_stable,
          col7: v.createdAt,
        });
      });

      const table = new Table(tableData, {
        noWrap: true,
        maxWidth: 60,
        padding: {
          left: '| ',
          right: ' |',
        },
      });

      return table.toString();
    });
};
