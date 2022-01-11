const chalk = require('chalk');
const config = require('config');
const open = require('open');
const configStore = require('../lib/configstore');
const loginCmd = require('./login');

exports.command = 'open';
exports.usage = 'open';
exports.description = 'Open your current ReadMe project in the browser.';
exports.category = 'utilities';
exports.position = 2;

exports.args = [];

exports.run = function (opts) {
  const project = configStore.get('project');
  if (!project) {
    return Promise.reject(new Error(`Please login using \`${config.get('cli')} ${loginCmd.command}\`.`));
  }

  const url = config.get('hub').replace('{project}', project);

  return (opts.mockOpen || open)(url, {
    wait: false,
    url: true,
  }).then(() => Promise.resolve(`Opening ${chalk.green(url)} in your browser...`));
};
