const pkg = require('../../package.json');

/**
 * @example 14
 * @returns {String} The major Node.js version specified in the package.json
 */
module.exports = function getNodeVersion() {
  const { node } = pkg.engines;
  return Array.from(node.matchAll(/\d+/g)).pop();
};
