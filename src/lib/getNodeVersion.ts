import pkg from '../../package.json';

/**
 * Return the major Node.js version specified in our `package.json` config.
 *
 * @example 14
 */
export default function getNodeVersion() {
  const { node } = pkg.engines;
  return Array.from(node.matchAll(/\d+/g)).pop().toString();
}
