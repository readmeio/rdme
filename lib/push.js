var utils = require('../utils');
var request = require('request');
var fs = require('fs');
var path = require('path');

exports.swagger = true;
exports.login = true;
exports.desc = "Get a public URL for your API";
exports.category = "services";

exports.run = function(config, info, cb) {
  if (!cb) cb = () => {};

  var formData = {
    swagger: fs.createReadStream(path.join(process.cwd(), info.args[0])),
  };
  request.post(`${config.host.url}/v1/api/swagger`, { formData, auth: { user: info.opts.token } }, function(err, response, data) {
    if (err) return cb(err);
    if (response.statusCode === 201) {
      console.log("");
      console.log("Success! ".green);
    } else {
      console.log(data)
      console.error("There was an error uploading!".red);
    }

    if (cb) return cb();
    process.exit();
  });

  //utils.open(info.swaggerUrl, info);

};
