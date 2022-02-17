const chalk = require('chalk');
const config = require('config');
const core = require('@actions/core');
const debug = require('debug')(config.get('cli'));
const isGHA = require('./isGitHub');

/**
 * Wrapper for debug statements.
 * @param {String} message Any number of arguments.
 */
module.exports.debug = function (message) {
  if (isGHA()) core.debug(message);
  return debug(message);
};

/**
 * Logs the output to stderr, formatted based on the environment
 * @param {String} message Any number of arguments.
 * @param {Object} opts optional annotation properties
 * @link GitHub docs on annotation properties
 * https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-error-message
 */
module.exports.error = function error(message, opts) {
  if (isGHA()) core.error(message, opts);
  // eslint-disable-next-line no-console
  else console.error(chalk.red(`\n${message}\n`));
};

/**
 * Logs the output to stdout, formatted based on the environment
 * @param {String} message Any number of arguments.
 * @param {Object} opts optional annotation properties
 * @link GitHub docs on annotation properties
 * https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-a-notice-message
 */
module.exports = function log(message, opts) {
  if (isGHA()) core.notice(message, opts);
  // eslint-disable-next-line no-console
  else console.log(message);
};

/**
 * Logs the arguments to stdout using console.warn()
 * with yellow text and prefixed with a '⚠️  Warning!'
 * @param {String} message Any number of arguments.
 * @param {Object} opts optional annotation properties
 * @link GitHub docs on annotation properties
 * https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-a-warning-message
 */
module.exports.warn = function (message, opts) {
  if (isGHA()) core.warning(message, opts);
  else console.warn(chalk.yellow('⚠️  Warning!', message));
};
