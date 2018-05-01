require('colors');

const path = require('path');
const config = require('config');

function load(command = 'help') {
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
}

function defaultCallback(err) {
  if (err) {
    console.error(err);
    return process.exit(1);
  }

  return process.exit();
}

module.exports = function(cmd, args, opts = {}, cb = defaultCallback) {
  const command = load(cmd);

  if (!command) return;

  command.run({ args, opts }, cb);
};
