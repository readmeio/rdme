const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const config = require('config');

exports.desc = 'Upload your swagger file to ReadMe';
exports.category = 'services';
exports.weight = 2;

exports.run = function({ args, opts }) {
  let { key, id } = opts;

  if (!key && opts.token) {
    console.warn(
      'Using `rdme` with --token has been deprecated. Please use --key and --id instead',
    );
    [key, id] = opts.token.split('-');
  }

  if (!key) {
    return Promise.reject(new Error('No api key provided. Please use --key'));
  }

  if (!args[0]) {
    return Promise.reject(
      new Error('No swagger file provided. Usage `rdme swagger <swagger-file>`'),
    );
  }

  function success(data) {
    const msg = data.headers.location
      ? `You've successfully uploaded a new swagger file to your Readme.io project! You can view it here directly: ${data.headers.location}`
      : 'Success!';
    console.log(msg.green);
  }

  function error(err) {
    try {
      return Promise.reject(new Error(JSON.parse(err.error).description));
    } catch (e) {
      return Promise.reject(new Error('There was an error uploading!'));
    }
  }

  const options = {
    formData: {
      spec: fs.createReadStream(path.resolve(process.cwd(), args[0])),
    },
    auth: { user: key },
    resolveWithFullResponse: true,
  };

  // Create
  if (!id) {
    return request.post(`${config.host}/api/v1/api-specification`, options).then(success, error);
  }

  // Update
  return request.put(`${config.host}/api/v1/api-specification/${id}`, options).then(success, error);
};
