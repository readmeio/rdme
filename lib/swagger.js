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
    console.log(data);
    console.log('Success! '.green);
  }

  function error(err) {
    console.log(err.error);
    console.error('There was an error uploading!'.red);
  }

  const options = {
    formData: {
      swagger: fs.createReadStream(path.resolve(process.cwd(), args[0])),
    },
    auth: { user: key },
  };

  // Create
  if (!id) {
    return request.post(`${config.host}/api/v1/swagger`, options).then(success, error);
  }

  // Update
  return request.put(`${config.host}/api/v1/swagger/${id}`, options).then(success, error);
};
