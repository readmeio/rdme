import type { Options as OraOptions } from 'ora';
import type { Writable } from 'type-fest';

import * as core from '@actions/core';
import chalk from 'chalk';
import config from 'config';
import debugModule from 'debug';

import { isGHA } from './isCI';

const debugPackage = debugModule(config.get('cli'));

/**
 * Wrapper for debug statements.
 */
function debug(input: string) {
  /* istanbul ignore next */
  if (isGHA() && process.env.NODE_ENV !== 'test') core.debug(`rdme: ${input}`);
  return debugPackage(input);
}

/**
 * Wrapper for warn statements.
 */
function warn(input: string) {
  /* istanbul ignore next */
  if (isGHA() && process.env.NODE_ENV !== 'test') return core.warning(input);
  // eslint-disable-next-line no-console
  return console.warn(chalk.yellow(`⚠️  Warning! ${input}`));
}

/**
 * Wrapper for info/notice statements.
 */
function info(input: string) {
  /* istanbul ignore next */
  if (isGHA() && process.env.NODE_ENV !== 'test') return core.notice(input);
  // eslint-disable-next-line no-console
  return console.info(`ℹ️  ${input}`);
}

function oraOptions() {
  // Disables spinner in tests so it doesn't pollute test output
  const opts: Writable<OraOptions> = { isSilent: process.env.NODE_ENV === 'test' };

  // Cleans up ora output so it prints nicely alongside debug logs
  /* istanbul ignore next */
  if (debugPackage.enabled) opts.isEnabled = false;
  return opts;
}

export { debug, warn, info, oraOptions };
