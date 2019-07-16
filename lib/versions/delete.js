const request = require('request-promise-native');
const config = require('config');
const { validateErrors } = require('../../utils/errorhandler');

exports.desc = 'Delete a version associated with your ReadMe project';
exports.category = 'services';
exports.weight = 4;
exports.action = 'versions:delete';

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
    .delete(`${config.host}/api/v1/version/${version}`, {
      auth: { user: key },
    })
    .then(() => Promise.resolve(`Version ${version} deleted successfully`))
    .catch(err => {
      let errorDesc;
      try {
        errorDesc = JSON.parse(err.error).description;
      } catch (e) {
        errorDesc = 'Failed to delete target version.';
      }
      return Promise.reject(new Error(errorDesc));
    });
};
