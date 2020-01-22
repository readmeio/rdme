require('colors');
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

exports.run = function(opts) {
  const project = configStore.get('project');
  if (!project) {
    return Promise.reject(new Error(`Please login using \`${config.cli} ${loginCmd.command}\`.`));
  }

  return (opts.mockOpen || open)(config.hub.replace('{project}', project), {
    wait: false,
    url: true,
  }).then(() => {
    console.log(`Opening ${config.hub.replace('{project}', project).green} in your browser...`);
  });
};
