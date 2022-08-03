import pkg from './getPackage.js';

/**
 * @example 14
 * @returns {String} The major Node.js version specified in the package.json
 */
export default function getNodeVersion() {
  const { node } = pkg.engines;
  return Array.from(node.matchAll(/\d+/g)).pop();
}
