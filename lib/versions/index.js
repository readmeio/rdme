const request = require('request-promise-native');
const config = require('config');

exports.desc = 'List versions available in your project';
exports.category = 'services';
exports.weight = 3;

exports.run = function({ opts }) {
  let { key } = opts;

  if (!key && opts.token) {
    console.warn(
      'Using `rdme` with --token has been deprecated. Please use --key and --id instead',
    );
    [key] = opts.token.split('-');
  }

  if (!key) {
    return Promise.reject(new Error('No api key provided. Please use --key'));
  }

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
