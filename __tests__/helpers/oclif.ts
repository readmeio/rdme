import type { CommandClass } from '../../src/index.js';

import path from 'node:path';

import { Config } from '@oclif/core';
import { captureOutput, runCommand as oclifRunCommand } from '@oclif/test';

export type OclifOutput<T = string> = ReturnType<typeof captureOutput<T>>;

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
 *
 * @example runCommand(LoginCommand)(['--email', 'owlbert@example.com', '--password', 'password'])
 */
export function runCommand(Command: CommandClass) {
  return async function runCommandAgainstArgs(args?: string[]) {
    const oclifConfig = await setupOclifConfig();
    return captureOutput<string>(() => Command.run(args, oclifConfig), { testNodeEnv });
  };
}

/**
 * A slight variation on `runCommand` that returns the result of the command and throws
 * an error if the command throws one. Mainly a helper to minimize the amount of refactoring
 * in our existing tests.
 *
 * @deprecated This is a legacy helper to aid with the initial migration to `oclif`.
 * Use `runCommand` for all new tests instead.
 * @example runCommandAndReturnResult(LoginCommand)(['--email', 'owlbert@example.com', '--password', 'password'])
 */
export function runCommandAndReturnResult(Command: CommandClass) {
  return async function runCommandAgainstArgs(args?: string[]) {
    const { error, result } = await runCommand(Command)(args);
    if (error) {
      throw error;
    }
    return result;
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
