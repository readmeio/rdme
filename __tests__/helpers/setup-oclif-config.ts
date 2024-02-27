import path from 'node:path';

import { Config } from '@oclif/core';

/**
 * Used for setting up the oclif configuration for simulating commands in tests.
 * This is a really barebones approach so we can continue using vitest + nock
 * how we want to.
 *
 * @see {@link https://github.com/oclif/test}
 * @see {@link https://oclif.io/docs/testing}
 */
export default function setupOclifConfig() {
  // https://stackoverflow.com/a/61829368
  const root = path.join(new URL('.', import.meta.url).pathname, '.');

  return Config.load({
    root,
    version: '7.0.0',
  });
}
