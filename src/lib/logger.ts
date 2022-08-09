import type { Options as OraOptions } from 'ora';
import type { Writable } from 'type-fest';

import core from '@actions/core';
import chalk from 'chalk';
import config from 'config';
import debugModule from 'debug';

import isGHA from './isGitHub';

const debugPackage = debugModule(config.get('cli'));

/**
 * Wrapper for debug statements.
 * @param {String} input
 */
function debug(input: string) {
  /* istanbul ignore next */
  if (isGHA() && process.env.NODE_ENV !== 'testing') core.debug(`rdme: ${input}`);
  return debugPackage(input);
}

/**
 * Wrapper for warn statements.
 * @param {String} input
 */
function warn(input: string) {
  /* istanbul ignore next */
  if (isGHA() && process.env.NODE_ENV !== 'testing') return core.warning(input);
  // eslint-disable-next-line no-console
  return console.warn(chalk.yellow(`⚠️  Warning! ${input}`));
}

/**
 * Wrapper for info/notice statements.
 * @param {String} input
 */
function info(input: string) {
  /* istanbul ignore next */
  if (isGHA() && process.env.NODE_ENV !== 'testing') return core.notice(input);
  // eslint-disable-next-line no-console
  return console.info(input);
}

function oraOptions() {
  // Disables spinner in tests so it doesn't pollute test output
  const opts: Writable<OraOptions> = { isSilent: process.env.NODE_ENV === 'testing' };

  // Cleans up ora output so it prints nicely alongside debug logs
  /* istanbul ignore next */
  if (debugPackage.enabled) opts.isEnabled = false;
  return opts;
}

export { debug, warn, info, oraOptions };
