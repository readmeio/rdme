const chalk = require('chalk');
const config = require('config');
const core = require('@actions/core');
const debug = require('debug')(config.get('cli'));
const isGHA = require('./isGitHub');

/**
 * Wrapper for debug statements.
 * @param {String} arg
 */
module.exports = function (arg) {
  if (isGHA()) core.debug(arg);
  return debug(arg);
};

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
