const semver = require('semver');
const pkg = require('../../package.json');

module.exports = {
  /**
   * Determine if the current version of Node is one that we explicitly support.
   *
   */
  isSupportedNodeVersion(version) {
    return semver.satisfies(semver.coerce(version), pkg.engines.node);
  },

  /**
   * @example 14
   * @returns {String} The maximum major Node.js version specified in the package.json
   */
  getNodeVersion() {
    const { node } = pkg.engines;
    return Array.from(node.matchAll(/\d+/g)).pop();
  },
};
