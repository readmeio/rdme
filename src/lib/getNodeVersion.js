/* eslint-disable @typescript-eslint/no-var-requires */
const pkg = require('../../package.json');

/**
 * Return the major Node.js version specified in our `package.json` config.
 *
 * @example 14
 */
module.exports = function getNodeVersion() {
  const { node } = pkg.engines;
  return Array.from(node.matchAll(/\d+/g)).pop().toString();
};
