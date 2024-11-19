import type { Command as OclifCommand } from '@oclif/core';

import path from 'node:path';

import { Config } from '@oclif/core';
import { captureOutput } from '@oclif/test';

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

export function runCommand<T extends typeof OclifCommand>(Command: T) {
  return async function runCommandAgainstArgs(args?: string[]) {
    const oclifConfig = await setupOclifConfig();
    // @ts-expect-error this is the pattern recommended by the @oclif/test docs.
    // Not sure how to get this working with type generics.
    return captureOutput<string>(() => Command.run(args, oclifConfig), { testNodeEnv: 'rdme-test' }).then(
      ({ error, result }) => {
        if (error) {
          const e = new Error(error.message);
          if (error.name) e.name = error.name;
          throw e;
        }
        return result;
      },
    );
  };
}
