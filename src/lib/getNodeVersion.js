/* eslint-disable @typescript-eslint/no-var-requires */
const pkg = require('../../package.json');

/**
 * The reason this file has remained in JavaScript is because we need to
 * be able to run this file without installing/building any dependencies.
 */

/**
 * Return the major Node.js version specified in our `package.json` config.
 *
 * @example 14
 */
module.exports = function getNodeVersion() {
  const { node } = pkg.engines;
  return Array.from(node.matchAll(/\d+/g)).pop().toString();
};
