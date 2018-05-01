require('colors');

const path = require('path');

const utils = require('./utils');

function load(config, command = 'help') {
  const file = path.join(__dirname, 'lib', `${command}.js`);
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(file);
  } catch (e) {
    console.error('Command not found.'.red);
    console.warn(`Type ${`${config.cli} help`.yellow} to see all commands`);
    process.exitCode = 1;
    return undefined;
  }
};

module.exports = function(args, opts = {}) {
  const config = utils.config(opts.env);

  const command = load(config, args[0]);

  if (!command) return;

  command.run(config, { args, opts });
};
