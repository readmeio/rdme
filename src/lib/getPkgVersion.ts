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
 * @param type the value to retrieve.
 *
 * If set to `latest`, it returns the `latest` dist tag from the `npm` registry.
 * @see {@link https://docs.npmjs.com/cli/dist-tag}
 *
 * If `type` is set to `major`, the major version from the `package.json` is returned.
 *
 * If `type` is omitted, the raw version from the `package.json` is returned.
 * @example "8.0.0"
 * @note we mock this function in our snapshots, hence it's not the default
 * @see {@link https://stackoverflow.com/a/54245672}
 */
export async function getPkgVersion(type?: 'latest' | 'major'): Promise<string> {
  if (type === 'latest') {
    return fetch(registryUrl)
      .then(res => res.json())
      .then(body => body['dist-tags'][type])
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('error fetching version from npm registry:', err.message);
        return pkg.version;
      });
  }

  if (type === 'major') {
    return semver.major(pkg.version).toString();
  }

  return pkg.version;
}
