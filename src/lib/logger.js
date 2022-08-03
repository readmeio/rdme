import chalk from 'chalk';
import config from './config.cjs';
import core from '@actions/core';
import debugNPM from 'debug';
import isGHA from './isGitHub.js';

const debugPackage = debugNPM(config.get('cli'));

/**
 * Wrapper for debug statements.
 * @param {String} input
 */
export function debug(input) {
  /* istanbul ignore next */
  if (isGHA() && process.env.NODE_ENV !== 'testing') core.debug(`rdme: ${input}`);
  return debugPackage(input);
}

/**
 * Wrapper for warn statements.
 * @param {String} input
 */
export function warn(input) {
  /* istanbul ignore next */
  if (isGHA() && process.env.NODE_ENV !== 'testing') return core.warning(input);
  // eslint-disable-next-line no-console
  return console.warn(chalk.yellow(`⚠️  Warning! ${input}`));
}

/**
 * Wrapper for info/notice statements.
 * @param {String} input
 */
export function info(input) {
  /* istanbul ignore next */
  if (isGHA() && process.env.NODE_ENV !== 'testing') return core.notice(input);
  // eslint-disable-next-line no-console
  return console.info(input);
}

export function oraOptions() {
  // Disables spinner in tests so it doesn't pollute test output
  const opts = { isSilent: process.env.NODE_ENV === 'testing' };
  // Cleans up ora output so it prints nicely alongside debug logs
  /* istanbul ignore next */
  if (debugPackage.enabled) opts.isEnabled = false;
  return opts;
}
