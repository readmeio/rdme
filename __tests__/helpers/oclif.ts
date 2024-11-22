import type { Command as OclifCommand } from '@oclif/core';

import path from 'node:path';

import { Config } from '@oclif/core';
import { captureOutput, runCommand as oclifRunCommand } from '@oclif/test';

const testNodeEnv = process.env.NODE_ENV;

/**
 * Used for setting up the oclif configuration for simulating commands in tests.
 * This is a really barebones approach so we can continue using vitest + nock
 * how we want to.
 *
 * @see {@link https://github.com/oclif/test}
 * @see {@link https://oclif.io/docs/testing}
 */
export function setupOclifConfig() {
  // https://stackoverflow.com/a/61829368
  const root = path.join(new URL('.', import.meta.url).pathname, '.');

  return Config.load({
    root,
    version: '7.0.0',
  });
}

/**
 * This runs the command you pass in against the args you pass in.
 * This helper is preferred because `vitest --watch` will properly reload
 * when you make changes to your command.
 */
export function runCommand<T extends typeof OclifCommand>(Command: T) {
  return async function runCommandAgainstArgs(args?: string[]) {
    const oclifConfig = await setupOclifConfig();
    // @ts-expect-error this is the pattern recommended by the @oclif/test docs.
    // Not sure how to get this working with type generics.
    return captureOutput<string>(() => Command.run(args, oclifConfig), { testNodeEnv });
  };
}

/**
 * This runs the command you pass in against the args you pass in.
 * This helper is not ideal in that `vitest --watch` won't reload,
 * but it's helpful if you need to run assertions against the command's hooks.
 */
export async function runCommandWithHooks(args?: string[]) {
  const oclifConfig = await setupOclifConfig();
  return oclifRunCommand(args, oclifConfig, { testNodeEnv });
}
