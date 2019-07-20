const config = require('config');
const open = require('opn');
const configStore = require('../lib/configstore');

exports.command = 'open';
exports.usage = 'open';
exports.description = 'Open your current ReadMe project in the browser';
exports.category = 'utilities';
exports.weight = 1;

exports.args = [];

exports.run = function(opts) {
  const project = configStore.get('project');
  if (!project) {
    return Promise.reject(new Error(`Please login using \`${config.cli} login\`.`));
  }

  return (opts.mockOpen || open)(config.hub.replace('{project}', project), {
    wait: false,
  }).then(() => {
    console.log(`Opening ${config.hub.replace('{project}', project).green} in your browser...`)
  });
};
