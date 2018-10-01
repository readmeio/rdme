const path = require('path');
// We have to do this otherwise `require('config')` loads
// from the cwd where the user is running `rdme` which
// wont be what we want
//
// This is a little sketchy overwriting environment variables
// but since this is only supposed to be a cli and not
// requireable, i think this is okay
const configDir = process.env.NODE_CONFIG_DIR;
process.env.NODE_CONFIG_DIR = path.join(__dirname, '/config');

const config = require('config');

process.env.NODE_CONFIG_DIR = configDir;

const { version } = require('./package.json');
const configStore = require('./lib/configstore');

function load(command = '', subcommand = '') {
  const file = path.join(__dirname, 'lib', command, subcommand);
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

  let command = cmd || '';
  let subcommand;

  if (command.includes(':')) {
    [command, subcommand] = cmd.split(':');
  }

  const optsWithStoredKey = Object.assign({}, { key: configStore.get('apiKey') }, opts);

  try {
    return load(opts.help ? 'help' : command, subcommand).run({ args, opts: optsWithStoredKey });
  } catch (e) {
    return Promise.reject(e);
  }
};
