import { Flags, type Hook } from '@oclif/core';
import chalk from 'chalk';

import configstore from '../configstore.js';
import getCurrentConfig from '../getCurrentConfig.js';
import isCI from '../isCI.js';
import { info } from '../logger.js';
import loginFlow from '../loginFlow.js';

const hook: Hook<'prerun'> = async function run(options) {
  if (options.Command?.flags?.key) {
    // eslint-disable-next-line no-param-reassign
    options.Command.flags.key = Flags.string({
      async parse(input) {
        const { email, project } = getCurrentConfig();
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
      default: async () => {
        if (isCI()) {
          // TODO make sure this error throws properly
          // this.error('No project API key provided. Please use `--key`.');
          throw new Error('No project API key provided. Please use `--key`.');
        }
        info("Looks like you're missing a ReadMe API key, let's fix that! 🦉", { includeEmojiPrefix: false });
        const result = await loginFlow();
        info(result, { includeEmojiPrefix: false });
        return configstore.get('apiKey');
      },
    });
  }

  if (options.Command?.flags?.github && isCI()) {
    // eslint-disable-next-line no-param-reassign
    options.Command.flags.github = Flags.boolean({
      async parse() {
        throw new Error('The `--github` flag is only for usage in non-CI environments.');
      },
    });
  }
};

export default hook;
