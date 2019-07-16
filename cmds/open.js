const config = require('config');
const open = require('opn');

exports.command = 'open';
exports.desc = 'Open your current ReadMe project in the browser'.grey;

const configStore = require('../lib/configstore');

exports.handler = function(opts) {
  const project = configStore.get('project');

  if (!project) {
    return Promise.reject(new Error(`Please login using \`${config.cli} login\`.`));
  }

  return (opts.mockOpen || open)(config.hub.replace('{project}', project), {
    wait: false,
  }).then(() => null);
};
