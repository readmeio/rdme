import type { Command, Hook } from '@oclif/core';
import type { Hooks } from '@oclif/core/interfaces';

import createGHA from '../createGHA/index.js';

type ParsedOpts = Record<string, unknown>;

export interface CreateGHAHookOptsInClass {
  parsedOpts?: ParsedOpts;
  result: string;
}

type CreateGHAHookOpts = Omit<CreateGHAHookOptsInClass, 'parsedOpts'> & {
  command: Command.Class;
  parsedOpts: ParsedOpts;
};

export interface CreateGHAHook extends Hooks {
  createGHA: {
    options: CreateGHAHookOpts;
    return: string;
  };
}

const hook: Hook<'createGHA', CreateGHAHook> = async function createGHAHook(options) {
  const msg = options.result;
  const command = options.command;
  const parsedOpts = options.parsedOpts;

  return createGHA.call(this, msg, command, parsedOpts);
};

export default hook;
