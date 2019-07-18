const request = require('request-promise-native');
const config = require('config');

exports.desc = 'Delete a version associated with your ReadMe project';
exports.category = 'services';
exports.weight = 4;
exports.action = 'versions:delete';

exports.run = async function({ opts }) {
  const { key, version } = opts;

  if (!key) {
    return Promise.reject(new Error('No api key provided. Please use --key'));
  }

  if (!version) {
    return Promise.reject(
      new Error('No version provided. Please specify a semantic version using --version'),
    );
  }

  return request
    .delete(`${config.host}/api/v1/version/${version}`, {
      auth: { user: key },
    })
    .then(() => Promise.resolve(`Version ${version} deleted successfully`))
    .catch(err => {
      return Promise.reject(
        new Error(
          err.error && err.error.description
            ? err.error.description
            : 'Failed to delete target version.',
        ),
      );
    });
};
