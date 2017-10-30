var utils = require('../utils');
var request = require('request');

exports.swagger = true;
exports.login = true;
exports.desc = "Get a public URL for your API";
exports.category = "services";

exports.run = function(config, info) {
  var form = {
    token: info.opts.token,
    swagger: info.swagger,
  };
  console.log(info.opts.token);
  request.post(`${config.host.url}/cli/swagger`, { json: true, form: form }, function(a, b, data) {
    if (data.success) {
      console.log("");
      console.log("Success! ".green + "You can now access your Swagger from the following publicly sharable URL:");
      console.log("");
      console.log("  " + info.swaggerUrl);
      console.log("");
      console.log("You can also use .yaml to get the YAML representation.".grey);
    } else {
      console.log("NO");
    }

    process.exit();
  });

  //utils.open(info.swaggerUrl, info);

};
