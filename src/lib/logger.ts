/** biome-ignore-all lint/suspicious/noConsole: This is our wrapper for `console.*`. */
import type { Options as OraOptions } from 'ora';
import type { Writable } from 'type-fest';

import * as core from '@actions/core';
import chalk from 'chalk';
import debugModule from 'debug';

import { isGHA, isTest } from './isCI.js';

const debugPackage = debugModule('rdme');

/**
 * Wrapper for debug statements.
 */
function debug(input: unknown) {
  /* istanbul ignore next */
  if (isGHA() && !isTest()) {
    if (typeof input === 'object') {
      core.debug(`rdme: ${JSON.stringify(input)}`);
    } else {
      core.debug(`rdme: ${input}`);
    }
  }

  return debugPackage(input);
}

/**
 * Wrapper for error statements.
 */
function error(input: string) {
  /* istanbul ignore next */
  if (isGHA() && !isTest()) return core.error(input);
  return console.error(chalk.red(input));
}

/**
 * Wrapper for info/notice statements.

 */
function info(
  input: string,
  opts = {
    /** whether or not to prefix the statement with this emoji: ℹ️ */
    includeEmojiPrefix: true,
  },
) {
  /* istanbul ignore next */
  if (isGHA() && !isTest()) return core.notice(input);
  /* istanbul ignore next */
  if (!opts.includeEmojiPrefix) return console.info(input);
  return console.info(`ℹ️  ${input}`);
}

function oraOptions() {
  const opts: Writable<OraOptions> = {};

  // Cleans up ora output so it prints nicely alongside debug logs
  /* istanbul ignore next */
  if (debugPackage.enabled) opts.isEnabled = false;
  return opts;
}

/**
 * Wrapper for warn statements.
 */
function warn(
  /**
   * Text that precedes the warning.
   * This is *not* used in the GitHub Actions-formatted warning.
   */
  input: string,
  prefix = 'Warning!',
) {
  /* istanbul ignore next */
  if (isGHA() && !isTest()) return core.warning(input);
  return console.warn(chalk.yellow(`⚠️  ${prefix} ${input}`));
}

export { debug, error, info, oraOptions, warn };
