import fetch from 'node-fetch';

import pkg from '../../package.json';

const registryUrl = 'https://registry.npmjs.com/rdme';

/**
 * The current `rdme` version.
 */
export function getPkgVersion() {
  return pkg.version;
}

/**
 * The current `rdme` version for a specific npm dist tag.
 *
 * @param npmDistTag the `npm` dist tag to retrieve.
 * @example "8.0.0"
 * @see {@link https://docs.npmjs.com/cli/dist-tag}
 * @note we mock this function in our snapshots
 * @see {@link https://stackoverflow.com/a/54245672}
 */
export async function getDistPkgVersion(npmDistTag: 'latest' | 'next'): Promise<string> {
  return fetch(registryUrl)
    .then(res => res.json())
    .then(body => body['dist-tags'][npmDistTag])
    .catch(() => {
      // eslint-disable-next-line no-console
      console.error('error fetching version from npm registry');
      return pkg.version;
    });
}
