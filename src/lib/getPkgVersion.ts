// eslint-disable-next-line no-restricted-imports
import fetch from 'node-fetch';
import semver from 'semver';

import pkg from '../../package.json';

const registryUrl = 'https://registry.npmjs.com/rdme';

/**
 * Return the major Node.js version specified in our `package.json` config.
 *
 * @example 14
 */
export function getNodeVersion() {
  const { node } = pkg.engines;
  return semver.minVersion(node).major;
}

/**
 * The current `rdme` version
 *
 * @param npmDistTag the `npm` dist tag to retrieve. If this value is omitted,
 * the version from the `package.json` is returned.
 * @example "8.0.0"
 * @see {@link https://docs.npmjs.com/cli/dist-tag}
 * @note we mock this function in our snapshots, hence it's not the default
 * @see {@link https://stackoverflow.com/a/54245672}
 */
export async function getPkgVersion(npmDistTag?: 'latest' | 'next'): Promise<string> {
  if (npmDistTag) {
    return fetch(registryUrl)
      .then(res => res.json())
      .then(body => body['dist-tags'][npmDistTag])
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('error fetching version from npm registry:', err.message);
        return pkg.version;
      });
  }
  return pkg.version;
}
