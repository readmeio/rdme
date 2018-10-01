const config = require('config');
const open = require('opn');

exports.desc = 'Open your current ReadMe project in the browser';
exports.category = 'utilities';
exports.weight = 1;

const configStore = require('../lib/configstore');

exports.run = function ({ opts }) {
  const project = configStore.get('project');

  if (!project) {
    return Promise.reject(new Error(`Please login using ${config.cli} login`));
  }

  return (opts.mockOpen || open)(config.hub.replace('{project}', project), {
    wait: false,
  }).then(() => null);
}
