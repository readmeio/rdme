import * as core from '@actions/core';
import chalk from 'chalk';
import debugModule from 'debug';

import { isGHA, isTest } from './isCI.js';
import { redactLoggedValue } from './secrets.js';
import { installDebugSanitizer } from './workflowCommands.js';

// The `debug` package writes stderr. Install before any `debug()` call so `DEBUG=*` cannot forge
// a workflow command. `core.debug` below stays a real command.
installDebugSanitizer();

const debugPackage = debugModule('rdme');

function renderForActions(value: unknown) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * Wrapper for debug statements.
 *
 * The value is redacted once and that result is what both sinks receive. `core.debug` is the
 * Actions log. The `debug` package writes stderr, which the Actions runner also records.
 */
function debug(input: unknown) {
  const safe = redactLoggedValue(input);

  /* istanbul ignore next */
  if (isGHA() && !isTest()) {
    core.debug(`rdme: ${renderForActions(safe)}`);
  }

  return debugPackage(safe);
}

/**
 * Wrapper for error statements.
 */
function error(input: string) {
  /* istanbul ignore next */
  if (isGHA() && !isTest()) return core.error(input);
  // oxlint-disable-next-line no-console -- This is our wrapper for `console.error()`.
  return console.error(chalk.red(input));
}

/**
 * Wrapper for info/notice statements.
 *
 * @deprecated use the base command's `this.info` method instead.
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
  // oxlint-disable-next-line no-console -- This is our wrapper for `console.info()`.
  if (!opts.includeEmojiPrefix) return console.info(input);
  // oxlint-disable-next-line no-console -- This is our wrapper for `console.info()`.
  return console.info(`ℹ️  ${input}`);
}

/**
 * Options for ora spinners.
 */
function oraOptions() {
  const opts: { isEnabled?: false } = {};

  // Cleans up ora output so it prints nicely alongside debug logs
  /* istanbul ignore next */
  if (debugPackage.enabled) opts.isEnabled = false;
  return opts;
}

/**
 * Wrapper for warn statements.
 *
 * @deprecated use the base command's `this.warn` method instead.
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
  // oxlint-disable-next-line no-console -- This is our wrapper for `console.warn()`.
  return console.warn(chalk.yellow(`⚠️  ${prefix} ${input}`));
}

export { debug, error, info, oraOptions, warn };
