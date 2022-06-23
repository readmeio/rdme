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

module.exports.oraOptions = function oraOptions() {
  // Disables spinner in tests so it doesn't pollute test output
  const opts = { isSilent: process.env.NODE_ENV === 'testing' };
  // Cleans up ora output so it prints nicely alongside debug logs
  /* istanbul ignore next */
  if (debugPackage.enabled) opts.isEnabled = false;
  return opts;
};
