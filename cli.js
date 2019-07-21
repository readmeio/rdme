/* eslint-disable no-underscore-dangle */
const cliArgs = require('command-line-args');
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
const help = require('./lib/help');

function load(command = '', subcommand = '') {
  const file = path.join(__dirname, 'cmds', command, subcommand);
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(file);
  } catch (e) {
    console.log('e=', e);
    const error = new Error('Command not found.');
    error.description = `Type ${`${config.cli} help`.yellow} to see all commands`;
    throw error;
  }
}

/**
 * @param {Array} processArgv - An array of arguments from the current process. Can be used to mock
 *    fake CLI calls.
 * @return {Promise}
 */
module.exports = processArgv => {
  const mainArgs = [
    { name: 'help', alias: 'h', type: Boolean, description: 'Display this usage guide' },
    {
      name: 'version',
      alias: 'v',
      type: Boolean,
      description: `Show the current ${config.cli} version`,
    },
    { name: 'command', type: String, defaultOption: true },
  ];

  const argv = cliArgs(mainArgs, { partial: true, argv: processArgv });
  const cmd = argv.command || false;

  // Add support for `-H` and `-V` as `--help` and `--version` aliases.
  if (typeof argv._unknown !== 'undefined') {
    if (argv._unknown.indexOf('-H') !== -1) {
      argv.help = true;
    }

    if (argv._unknown.indexOf('-V') !== -1) {
      argv.help = true;
    }
  }

  if (argv.version && (!cmd || cmd === 'help')) return Promise.resolve(version);
  if (!cmd || cmd === 'help') return Promise.resolve(help.globalUsage(mainArgs));

  let command = cmd || '';
  let subcommand;

  if (command.includes(':')) {
    [command, subcommand] = cmd.split(':');
  }

  // console.log('argv=', argv)
  // console.log('process.argv=', process.argv.slice(3))
  // console.log('---------------')

  try {
    const bin = load(command, subcommand);

    if (argv.help) {
      return Promise.resolve(help.commandUsage(bin));
    }

    let cmdArgv;
    try {
      cmdArgv = cliArgs(bin.args, { argv: argv._unknown || [] });
    } catch (e) {
      // If we have a command that has its own `--version` argument to accept data, that argument,
      // if supplied in the `--version VERSION_STRING` format instead of `--version=VERSION_STRING`,
      // will collide with the global version argument because their types differ and the argument
      // parser gets confused.
      //
      // Instead of failing out to the user with an undecipherable "Unknown value: ..." error, let's
      // try to parse their request again but a tade less eager.
      if (e.name !== 'UNKNOWN_VALUE' || (e.name === 'UNKNOWN_VALUE' && !argv.version)) {
        throw e;
      }

      cmdArgv = cliArgs(bin.args, { partial: true, argv: process.argv.slice(3) });
    }

    cmdArgv = Object.assign({}, { key: configStore.get('apiKey') }, cmdArgv);

    // console.log('bin=', bin);
    // console.log('binArgv=', cmdArgv)
    // console.log('---------------')

    return bin.run(cmdArgv);
  } catch (e) {
    // console.log('cli error=', e)
    return Promise.reject(e);
  }
};
