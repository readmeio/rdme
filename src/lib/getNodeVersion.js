const pkg = require('../../package.json');

/**
 * @example 14
 * @returns {String} The minimum major Node.js version specified in the package.json
 */
function extractNodeVersion() {
  const { node } = pkg.engines;

  const match = Array.from(node.matchAll(/\d+/g)).pop();

  return match;
}

module.exports = extractNodeVersion;
