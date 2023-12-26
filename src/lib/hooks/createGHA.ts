import type { Command, Hook } from '@oclif/core';

import createGHA from '../createGHA/new.js';

const hook: Hook<'createGHA'> = async function createGHAHook(options) {
  const msg = options.result as string;
  const command = options.command as Command.Class;
  const parsedOpts = options.parsedOpts as Record<string, string>;

  return createGHA.call(this, msg, command, parsedOpts);
};

export default hook;
