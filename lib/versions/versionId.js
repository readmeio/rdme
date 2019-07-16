const request = require('request-promise-native');
const config = require('config');
const { validateErrors } = require('../../utils/errorhandler');

exports.desc = 'Get a specific version from your project';
exports.category = 'services';
exports.weight = 4;
exports.action = 'versions:versionId';

exports.run = async function({ opts }) {
  const { key, version } = opts;

  await validateErrors([
    { key, message: 'No api key provided. Please use --key' },
    {
      key: version,
      message: 'No version provided. Please specify a semantic version using --version',
    },
  ]);

  return request
    .get(`${config.host}/api/v1/version/${version}`, {
      json: true,
      auth: { user: key },
    })
    .catch(err => {
      let errorDesc;
      try {
        errorDesc = JSON.parse(err.error).description;
      } catch (e) {
        errorDesc = 'Failed to get specific version using provided identifier and key.';
      }
      return Promise.reject(new Error(errorDesc));
    });
};
