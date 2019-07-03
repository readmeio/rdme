const request = require('request-promise-native');
const config = require('config');

exports.desc = 'Delete a version associated with your ReadMe project';
exports.category = 'services';
exports.weight = 4;
exports.action = 'versions:delete';

exports.run = async function({ opts }) {
  let { key } = opts;
  const { version } = opts;

  if (!key && opts.token) {
    console.warn(
      'Using `rdme` with --token has been deprecated. Please use --key and --id instead',
    );
    [key] = opts.token.split('-');
  }

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
