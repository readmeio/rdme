import { Flags, type Hook } from '@oclif/core';
import chalk from 'chalk';

import configstore from '../configstore.js';
import { githubFlag, keyFlag } from '../flags.js';
import getCurrentConfig from '../getCurrentConfig.js';
import isCI, { isTest } from '../isCI.js';
import { info } from '../logger.js';
import loginFlow from '../loginFlow.js';

const hook: Hook.Prerun = async function run(options) {
  this.debug('configstore location:', configstore.path);
  if (options.Command?.flags?.key) {
    this.debug('current command has --key flag');
    if (isTest()) {
      options.Command.flags.key = keyFlag;
    } else {
      options.Command.flags.key = Flags.string({
        // `parse` is run if the user passes in a `--key` flag
        parse: async input => {
          this.debug('--key flag detected in parse function');
          const { email, project } = getCurrentConfig.call(this);
          // We only want to log this if the API key is stored in the configstore, **not** in an env var.
          if (input && configstore.get('apiKey') === input) {
            info(
              `🔑 ${chalk.green(email)} is currently logged in, using the stored API key for this project: ${chalk.blue(
                project,
              )}`,
              { includeEmojiPrefix: false },
            );
          }
          return input;
        },
        // `default` is run if no `--key` flag is passed
        default: async () => {
          this.debug('no --key flag detected, running default function');
          const { apiKey } = getCurrentConfig.call(this);
          // if the user is passing an API key via env var or configstore, use that
          if (apiKey) {
            this.debug('api key found in config, returning');
            return apiKey;
          }
          if (isCI()) {
            throw new Error('No project API key provided. Please use `--key`.');
          }
          // if in non-CI and the user hasn't passed in a key, we prompt them to log in
          info("Looks like you're missing a ReadMe API key, let's fix that! 🦉", { includeEmojiPrefix: false });
          const result = await loginFlow.call(this);
          info(result, { includeEmojiPrefix: false });
          // loginFlow sets the configstore value, so let's use that
          return configstore.get('apiKey');
        },
      });
    }
  } else {
    this.debug('current command does not have --key flag');
  }

  // the logic in this block is a little weird it does two things:
  // 1. throws if the user is attempting to use --github in a CI environment
  // 2. resets the --github flag options to the default in certain tests
  if (options.Command?.flags?.github) {
    this.debug('current command has --github flag');
    if (isCI()) {
      this.debug('in CI environment');
      options.Command.flags.github = Flags.boolean({
        parse: () => {
          throw new Error('The `--github` flag is only for usage in non-CI environments.');
        },
      });
    }
    if (process.env.TEST_RDME_CREATEGHA) {
      options.Command.flags.github = githubFlag;
    }
  } else {
    this.debug('current command does not have --github flag');
  }
};

export default hook;
