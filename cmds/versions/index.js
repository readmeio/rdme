const request = require('request-promise-native');
const config = require('config');

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
    description: 'Project version',
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
    .catch(err => {
      return Promise.reject(
        new Error(
          err.error && err.error.description
            ? err.error.description
            : 'Failed to get version(s) attached to the provided key.',
        ),
      );
    });
};
