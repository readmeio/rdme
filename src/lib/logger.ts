import type { Options as OraOptions } from 'ora';
import type { Writable } from 'type-fest';

import * as core from '@actions/core';
import chalk from 'chalk';
import config from 'config';
import debugModule from 'debug';

import { isGHA, isTest } from './isCI';

const debugPackage = debugModule(config.get('cli'));

/**
 * Wrapper for debug statements.
 */
function debug(input: string) {
  /* istanbul ignore next */
  if (isGHA() && !isTest()) core.debug(`rdme: ${input}`);
  return debugPackage(input);
}

/**
 * Wrapper for error statements.
 */
function error(input: string) {
  /* istanbul ignore next */
  if (isGHA() && !isTest()) return core.error(input);
  // eslint-disable-next-line no-console
  return console.error(chalk.red(input));
}

/**
 * Wrapper for info/notice statements.
 * @param {Boolean} includeEmojiPrefix whether or not to prefix
 * the statement with this emoji: ℹ️
 */
function info(input: string, includeEmojiPrefix = true) {
  /* istanbul ignore next */
  if (isGHA() && !isTest()) return core.notice(input);
  /* istanbul ignore next */
  if (!includeEmojiPrefix) return console.info(input); // eslint-disable-line no-console
  // eslint-disable-next-line no-console
  return console.info(`ℹ️  ${input}`);
}

function oraOptions() {
  // Disables spinner in tests so it doesn't pollute test output
  const opts: Writable<OraOptions> = { isSilent: isTest() };

  // Cleans up ora output so it prints nicely alongside debug logs
  /* istanbul ignore next */
  if (debugPackage.enabled) opts.isEnabled = false;
  return opts;
}

/**
 * Wrapper for warn statements.
 */
function warn(input: string) {
  /* istanbul ignore next */
  if (isGHA() && !isTest()) return core.warning(input);
  // eslint-disable-next-line no-console
  return console.warn(chalk.yellow(`⚠️  Warning! ${input}`));
}

export { debug, error, info, oraOptions, warn };
