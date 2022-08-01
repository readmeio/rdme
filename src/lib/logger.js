const chalk = require('chalk');
const config = require('config');
const core = require('@actions/core');
const debugPackage = require('debug')(config.get('cli'));
const isGHA = require('./isGitHub');

/**
 * Wrapper for debug statements.
 * @param {String} input
 */
module.exports.debug = function debug(input) {
  /* istanbul ignore next */
  if (isGHA() && process.env.NODE_ENV !== 'testing') core.debug(`rdme: ${input}`);
  return debugPackage(input);
};

/**
 * Wrapper for warn statements.
 * @param {String} input
 */
module.exports.warn = function warn(input) {
  /* istanbul ignore next */
  if (isGHA() && process.env.NODE_ENV !== 'testing') return core.warning(input);
  // eslint-disable-next-line no-console
  return console.warn(chalk.yellow(`⚠️  Warning! ${input}`));
};

/**
 * Wrapper for info/notice statements.
 * @param {String} input
 */
module.exports.info = function info(input) {
  /* istanbul ignore next */
  if (isGHA() && process.env.NODE_ENV !== 'testing') return core.notice(input);
  // eslint-disable-next-line no-console
  return console.info(input);
};

module.exports.oraOptions = function oraOptions() {
  // Disables spinner in tests so it doesn't pollute test output
  const opts = { isSilent: process.env.NODE_ENV === 'testing' };
  // Cleans up ora output so it prints nicely alongside debug logs
  /* istanbul ignore next */
  if (debugPackage.enabled) opts.isEnabled = false;
  return opts;
};
