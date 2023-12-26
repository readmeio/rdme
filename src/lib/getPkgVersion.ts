import type { Hook } from '@oclif/core';

// eslint-disable-next-line no-restricted-imports
import fetch from 'node-fetch';
import semver from 'semver';

import pkg from '../package.json' assert { type: 'json' };

import { error } from './logger.js';

const registryUrl = 'https://registry.npmjs.com/rdme';

/**
 * @see {@link https://docs.npmjs.com/adding-dist-tags-to-packages}
 */
type npmDistTag = 'latest';

/**
 * Return the major Node.js version specified in our `package.json` config.
 *
 * @example 14
 */
export function getNodeVersion() {
  const { node } = pkg.engines;
  const parsedVersion = semver.minVersion(node);
  if (!parsedVersion) {
    throw new Error('`version` value in package.json is invalid');
  }
  return parsedVersion.major;
}

/**
 * The current `rdme` version
 *
 * @param npmDistTag the `npm` dist tag to retrieve. If this value is omitted,
 * the version from the `package.json` is returned.
 * @example "8.0.0"
 * @see {@link https://docs.npmjs.com/adding-dist-tags-to-packages}
 * @note we mock this function in our snapshots, hence it's not the default
 * @see {@link https://stackoverflow.com/a/54245672}
 */
export async function getPkgVersion(this: Hook.Context | void, npmDistTag?: npmDistTag): Promise<string> {
  if (npmDistTag) {
    return fetch(registryUrl)
      .then(res => res.json() as Promise<{ 'dist-tags': Record<string, string> }>)
      .then(body => body['dist-tags'][npmDistTag])
      .catch(err => {
        error(`error fetching version from npm registry: ${err.message}`);
        return pkg.version;
      });
  }
  return this?.config?.version || pkg.version;
}

/**
 * The current major `rdme` version
 *
 * @example 8
 */
export async function getMajorPkgVersion(this: Hook.Context | void, npmDistTag?: npmDistTag): Promise<number> {
  return semver.major(await getPkgVersion.call(this, npmDistTag));
}
