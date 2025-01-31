import type { Hook } from '@oclif/core';

import { readFileSync } from 'node:fs';

import semver from 'semver';

import { error } from './logger.js';

const registryUrl = 'https://registry.npmjs.com/rdme';

/**
 * @see {@link https://docs.npmjs.com/adding-dist-tags-to-packages}
 */
type npmDistTag = 'latest';

/**
 * A synchronous function that reads the `package.json` file for use elsewhere.
 * Until we drop support Node.js 20, we need to import this way to avoid ExperimentalWarning outputs.
 *
 * @see {@link https://nodejs.org/docs/latest-v20.x/api/esm.html#import-attributes}
 * @see {@link https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/}
 */
export const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), { encoding: 'utf-8' }));

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
export async function getMajorPkgVersion(this: Hook.Context | void, npmDistTag?: npmDistTag): Promise<number> {
  return semver.major(await getPkgVersionFromNPM.call(this, npmDistTag));
}
