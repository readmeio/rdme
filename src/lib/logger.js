const chalk = require('chalk');
const config = require('config');
const core = require('@actions/core');
const debugPackage = require('debug')(config.get('cli'));
const isGHA = require('./isGitHub');

/**
 * Wrapper for debug statements.
 * @param {String} arg
 */
function debug(arg) {
  if (isGHA() && process.env.NODE_ENV !== 'testing') core.debug(arg);
  return debugPackage(arg);
}

module.exports = debug;
module.exports.debug = debug;
