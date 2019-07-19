const request = require('request-promise-native');
const config = require('config');

exports.desc = 'List versions available in your project or get version by semver';
exports.category = 'versions';
exports.weight = 3;
exports.action = 'versions';

exports.run = function({ opts }) {
  const { key, version } = opts;

  if (!key) {
    return Promise.reject(new Error('No api key provided. Please use --key'));
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
