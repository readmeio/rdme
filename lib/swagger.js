var utils = require('../utils');
var request = require('request');
var fs = require('fs');
var path = require('path');

exports.swagger = true;
exports.login = true;
exports.desc = 'Upload your swagger file to ReadMe';
exports.category = "services";

exports.run = function(config, info, cb) {
  if (!cb) cb = (err) => {
    if (err) {
      console.error(err)
      return process.exit(1);
    }

    process.exit();
  };

  const [apiKey, id] = info.opts.token.split('-');

  function callback(err, response, data) {
    if (err) return cb(err);
    if (response.statusCode === 201 || response.statusCode === 200) {
      console.log(data);
      console.log("Success! ".green);
    } else {
      console.log(data);
      console.error("There was an error uploading!".red);
    }

    if (cb) return cb();
    process.exit();
  }

  const options = {
    formData: {
      swagger: fs.createReadStream(path.resolve(process.cwd(), info.args[1])),
    },
    auth: { user: apiKey },
  };

  if (!id) {
    request.post(`${config.host.url}/api/v1/swagger`, options, callback);    
  } else {
    request.put(`${config.host.url}/api/v1/swagger/${id}`, options, callback);    
  }
};
