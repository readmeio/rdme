const request = require('request');
const fs = require('fs');
const path = require('path');
const config = require('config');

exports.desc = 'Upload your swagger file to ReadMe';
exports.category = 'services';

function defaultCallback(err) {
  if (err) {
    console.error(err);
    return process.exit(1);
  }

  return process.exit();
}

exports.run = function({ args, opts }, cb = defaultCallback) {
  let {key, id} = opts;

  if (!key && opts.token) {
    console.warn('Using `rdme` with --token has been deprecated. Please use --key and --id instead');
    [key, id] = opts.token.split('-')
  }

  if (!key) {
    return cb(new Error('No api key provided. Please use --key'));
  }

  if (!args[0]) {
    return cb(new Error('No swagger file provided. Usage `rdme swagger <swagger-file>`'));
  }

  function callback(err, response, data) {
    if (err) return cb(err);
    if (response.statusCode === 201 || response.statusCode === 200) {
      console.log(data);
      console.log('Success! '.green);
    } else {
      console.log(data);
      console.error('There was an error uploading!'.red);
    }

    if (cb) return cb();
    return process.exit();
  }

  const options = {
    formData: {
      swagger: fs.createReadStream(path.resolve(process.cwd(), args[0])),
    },
    auth: { user: key },
  };

  if (!id) {
    return request.post(`${config.host}/api/v1/swagger`, options, callback);
  } else {
    return request.put(`${config.host}/api/v1/swagger/${id}`, options, callback);
  }
};
