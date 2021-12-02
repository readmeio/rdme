const chalk = require('chalk');
const config = require('config');
const configStore = require('../lib/configstore');
const loginCmd = require('./login');

exports.command = 'whoami';
exports.usage = 'whoami';
exports.description = 'Displays the current user and project authenticated with ReadMe.';
exports.category = 'admin';
exports.position = 3;

exports.args = [];

exports.run = () => {
  if (!configStore.has('email') || !configStore.has('project')) {
    return Promise.reject(new Error(`Please login using \`${config.cli} ${loginCmd.command}\`.`));
  }

  return Promise.resolve(
    `You are currently logged in as ${chalk.green(configStore.get('email'))} to the ${chalk.blue(
      configStore.get('project')
    )} project.`
  );
};
