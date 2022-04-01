const semver = require('semver');
const pkg = require('../../package.json');

/**
 * Determine if the current version of Node is one that we explicitly support.
 *
 */
module.exports = function isSupportedNodeVersion(version) {
  return semver.satisfies(semver.coerce(version), pkg.engines.node);
};
