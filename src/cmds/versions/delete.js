const config = require('config');
const APIError = require('../../lib/apiError');
const { getProjectVersion } = require('../../lib/versionSelect');
const { cleanHeaders } = require('../../lib/cleanHeaders');
const fetch = require('node-fetch');

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

  const selectedVersion = await getProjectVersion(version, key, false).catch(e => {
    return Promise.reject(e);
  });

  return fetch(`${config.host}/api/v1/version/${selectedVersion}`, {
    method: 'delete',
    headers: cleanHeaders(key),
  }).then(res => {
    if (res.error) {
      return Promise.reject(new APIError(res));
    }
    return Promise.resolve(`Version ${selectedVersion} deleted successfully.`);
  });
};
