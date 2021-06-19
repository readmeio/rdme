const config = require('config');
const configStore = require('../lib/configstore');
const loginCmd = require('./login');

exports.command = 'logout';
exports.usage = 'logout';
exports.description = 'Logs the currently authenticated user out of ReadMe.';
exports.category = 'admin';
exports.position = 2;

exports.args = [];

exports.run = async () => {
  if (configStore.has('email') && configStore.has('project')) {
    configStore.clear();
  }

  return Promise.resolve(
    `You have logged out of Readme. Please use \`${config.cli} ${loginCmd.command}\` to login again.`
  );
};
