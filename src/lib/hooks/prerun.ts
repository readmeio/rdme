// oxlint-disable no-param-reassign
import type { Hook } from '@oclif/core';

import { Flags } from '@oclif/core';

import configstore from '../configstore.js';
import { keyFlag } from '../flags.js';
import getCurrentConfig, { normalizeAPIKey } from '../getCurrentConfig.js';
import isCI from '../isCI.js';
import { info } from '../logger.js';
import loginFlow from '../loginFlow.js';

const hook: Hook.Prerun = async function run(options) {
  this.debug('configstore location:', configstore.path);
  if (options.Command?.flags?.key) {
    this.debug('current command has --key flag');
    options.Command.flags.key = Flags.string({
      summary: keyFlag.summary,
      required: keyFlag.required,
      description: keyFlag.description,
      parse: async input => {
        this.debug('--key flag detected in parse function');
        const trimmed = input === undefined || input === null ? '' : String(input).trim();
        if (!trimmed) {
          throw new Error('No project API key was specified.');
        }

        return trimmed;
      },

      // `default` is run if no `--key` flag is passed
      default: async () => {
        this.debug('no --key flag detected, running default function');
        const { apiKey } = getCurrentConfig.call(this);

        // if the user is passing an API key via an env var or configstore, use that
        if (apiKey) {
          this.debug('api key found in config, returning');
          return apiKey;
        }

        if (isCI()) {
          throw new Error(
            'No project API key was provided. Please provide one with `--key` or the `RDME_API_KEY` or `README_API_KEY` environment variables.',
          );
        }

        // if in non-CI and the user hasn't passed in a key, we prompt them to log in
        info("Looks like you're missing a ReadMe API key, let's fix that! 🦉", { includeEmojiPrefix: false });
        const result = await loginFlow.call(this);
        info(result, { includeEmojiPrefix: false });

        // loginFlow sets the configstore value, so let's use that
        const storedKey = normalizeAPIKey(configstore.get<string>('apiKey'));
        if (!storedKey) {
          throw new Error("We couldn't find your API key.");
        }

        return storedKey;
      },
    });
  } else {
    this.debug('current command does not have --key flag');
  }
};

export default hook;
