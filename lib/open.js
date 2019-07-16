const config = require('config');
const open = require('opn');
const { validateErrors } = require('../utils/errorhandler');

exports.desc = 'Open your current ReadMe project in the browser';
exports.category = 'utilities';
exports.weight = 1;

const configStore = require('../utils/configstore');

exports.run = async function({ opts }) {
  const project = configStore.get('project');

  await validateErrors([{ key: project, message: `Please login using ${config.cli} login` }]);

  return (opts.mockOpen || open)(config.hub.replace('{project}', project), {
    wait: false,
  }).then(() => null);
};
