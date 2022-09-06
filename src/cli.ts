#! /usr/bin/env node
import * as core from '@actions/core';
import chalk from 'chalk';
import updateNotifier from 'update-notifier';

import pkg from '../package.json';

import isGHA from './lib/isGitHub';

import rdme from '.';

updateNotifier({ pkg }).notify();

rdme(process.argv.slice(2))
  .then((msg: string) => {
    // eslint-disable-next-line no-console
    if (msg) console.log(msg);
    return process.exit(0);
  })
  .catch((err: Error) => {
    let message = `Yikes, something went wrong! Please try again and if the problem persists, get in touch with our support team at ${chalk.underline(
      'support@readme.io'
    )}.`;

    if (err.message) {
      message = err.message;
    }

    /**
     * If we're in a GitHub Actions environment, log errors with that formatting instead.
     *
     * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-error-message}
     * @see {@link https://github.com/actions/toolkit/tree/main/packages/core#annotations}
     */
    if (isGHA()) {
      return core.setFailed(message);
    }

    // eslint-disable-next-line no-console
    console.error(chalk.red(`\n${message}\n`));
    return process.exit(1);
  });
