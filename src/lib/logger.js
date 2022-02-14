const chalk = require('chalk');

/**
 * Logs the arguments to stdout using console.warn()
 * with yellow text and prefixed with a '⚠️  Warning!'
 * @param  {...any} args Any number of arguments.
 * The output will return the arguments separated
 * by a space.
 */
module.exports.warn = function (...args) {
  return console.warn(chalk.yellow('⚠️  Warning!', ...args));
};
