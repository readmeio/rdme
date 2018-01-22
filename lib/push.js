var utils = require('../utils');
var request = require('request');

exports.swagger = true;
exports.login = true;
exports.desc = "Get a public URL for your API";
exports.category = "services";

exports.run = function(config, info) {
  var form = {
    token: info.opts.token,
    swagger: JSON.stringify(info.swagger),
  };
  request.post(`${config.host.url}/cli/swagger`, { json: form }, function(a, b, data) {
    if (data.success) {
      console.log("");
      console.log("Success! ".green);
      // TODO: Link to the docs here
      /*
      console.log("");
      console.log("  " + info.swaggerUrl);
      console.log("");
      console.log("You can also use .yaml to get the YAML representation.".grey);
      */
    } else {
      console.log(data)
      console.error("There was an error uploading!".red);
    }

    process.exit();
  });

  //utils.open(info.swaggerUrl, info);

};
