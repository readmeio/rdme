var jsonfile = require('jsonfile')

exports.swagger = false;
exports.login = false;
exports.desc = "Authenticate this computer";
exports.category = "utility";

exports.run = function(config, info) {
  console.log('Log in to your ReadMe account!');
  console.log('');
};
