const path = require('path');
const config = require('config');
const { version } = require('./package.json');

function load(command = 'help') {
  const file = path.join(__dirname, 'lib', `${command}.js`);
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(file);
  } catch (e) {
    const error = new Error('Command not found.');
    error.description = `Type ${`${config.cli} help`.yellow} to see all commands`;
    throw error;
  }
}

module.exports = function(cmd, args, opts = {}) {
  if (opts.version && !cmd) return Promise.resolve(version);

  try {
    const command = load(opts.help ? 'help' : cmd);
    return command.run({ args, opts });
  } catch (e) {
    return Promise.reject(e);
  }
};
