const request = require('request-promise-native');
const config = require('config');
const APIError = require('../../lib/apiError');
const { getSwaggerVersion } = require('../../lib/versionSelect');

exports.command = 'versions:delete';
exports.usage = 'versions:delete --version=<version> [options]';
exports.description = 'Delete a version associated with your ReadMe project.';
exports.category = 'versions';
exports.position = 4;

exports.hiddenArgs = ['version'];
exports.args = [
  {
    name: 'key',
    type: String,
    description: 'Project API key',
  },
  {
    name: 'version',
    type: String,
    defaultOption: true,
  },
];

exports.run = async function (opts) {
  const { key, version } = opts;

  if (!key) {
    return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
  }

  const selectedVersion = await getSwaggerVersion(version, key, false).catch(e => {
    return Promise.reject(e);
  });

  return request
    .delete(`${config.host}/api/v1/version/${selectedVersion}`, {
      json: true,
      auth: { user: key },
    })
    .then(() => Promise.resolve(`Version ${selectedVersion} deleted successfully.`))
    .catch(err => Promise.reject(new APIError(err)));
};
