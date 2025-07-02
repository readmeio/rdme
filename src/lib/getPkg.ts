import type { Hook } from '@oclif/core';

import semver from 'semver';

import pkg from '../../package.json' with { type: 'json' };
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
export function getNodeVersion(): string {
  const { node } = pkg.engines;
  const parsedVersion = semver.minVersion(node);
  if (!parsedVersion) {
    throw new Error('`version` value in package.json is invalid');
  }
  return parsedVersion.version;
}

/**
 * The current `rdme` version, as specified in the `package.json`
 * or in the oclif hook context.
 *
 * @example "8.0.0"
 * @note we mock this function in our snapshots
 * @see {@link https://stackoverflow.com/a/54245672}
 */
// biome-ignore lint/suspicious/noConfusingVoidType: This function can be invoked with `.call()`.
export function getPkgVersion(this: Hook.Context | void): string {
  return this?.config?.version || pkg.version;
}

/**
 * The current `rdme` version
 *
 * @example "8.0.0"
 * @see {@link https://docs.npmjs.com/adding-dist-tags-to-packages}
 * @note we mock this function in our snapshots
 * @see {@link https://stackoverflow.com/a/54245672}
 */
export async function getPkgVersionFromNPM(
  // biome-ignore lint/suspicious/noConfusingVoidType: This function can be invoked with `.call()`.
  this: Hook.Context | void,
  /**
   * The `npm` dist tag to retrieve. If this value is omitted,
   * the version from the `package.json` is returned.
   */
  npmDistTag?: npmDistTag,
): Promise<string> {
  if (npmDistTag) {
    return fetch(registryUrl)
      .then(res => res.json() as Promise<{ 'dist-tags': Record<string, string> }>)
      .then(body => body['dist-tags'][npmDistTag])
      .catch(err => {
        error(`error fetching version from npm registry: ${err.message}`);
        return getPkgVersion.call(this);
      });
  }
  return getPkgVersion.call(this);
}

/**
 * The current major `rdme` version
 *
 * @example 8
 */
// biome-ignore lint/suspicious/noConfusingVoidType: This function can be invoked with `.call()`.
export async function getMajorPkgVersion(this: Hook.Context | void, npmDistTag?: npmDistTag): Promise<number> {
  return semver.major(await getPkgVersionFromNPM.call(this, npmDistTag));
}
