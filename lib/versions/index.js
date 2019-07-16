const request = require('request-promise-native');
const config = require('config');
const { validateErrors } = require('../../utils/errorhandler');

exports.desc = 'List versions available in your project';
exports.category = 'services';
exports.weight = 3;
exports.action = 'versions';

exports.run = async function({ opts }) {
  const { key } = opts;

  await validateErrors([{ key, message: 'No api key provided. Please use --key' }]);

  return request
    .get(`${config.host}/api/v1/version`, {
      json: true,
      auth: { user: key },
    })
    .catch(err => {
      let errorDesc;
      try {
        errorDesc = JSON.parse(err.error).description;
      } catch (e) {
        errorDesc = 'Failed to get versions attached to the provided key.';
      }
      return Promise.reject(new Error(errorDesc));
    });
};
