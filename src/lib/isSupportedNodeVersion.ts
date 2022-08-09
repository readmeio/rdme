import semver from 'semver';

import pkg from '../../package.json';

/**
 * Determine if the current version of Node is one that we explicitly support.
 *
 */
export default function isSupportedNodeVersion(version: string) {
  return semver.satisfies(semver.coerce(version), pkg.engines.node);
}
