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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debug(input: any) {
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
  // eslint-disable-next-line no-console
  return console.error(chalk.red(input));
}

/**
 * Wrapper for info/notice statements.

 */
function info(
  input: string,
  opts = {
    /** whether or not to prefix * the statement with this emoji: ℹ️ */
    includeEmojiPrefix: true,
  },
) {
  /* istanbul ignore next */
  if (isGHA() && !isTest()) return core.notice(input);
  /* istanbul ignore next */
  if (!opts.includeEmojiPrefix) return console.info(input); // eslint-disable-line no-console
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
 * @param prefix Text that precedes the warning.
 * This is *not* used in the GitHub Actions-formatted warning.
 */
function warn(input: string, prefix = 'Warning!') {
  /* istanbul ignore next */
  if (isGHA() && !isTest()) return core.warning(input);
  // eslint-disable-next-line no-console
  return console.warn(chalk.yellow(`⚠️  ${prefix} ${input}`));
}

export { debug, error, info, oraOptions, warn };
