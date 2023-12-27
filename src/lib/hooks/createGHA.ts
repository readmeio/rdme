import type { Command, Hook } from '@oclif/core';
import type { Hooks } from '@oclif/core/lib/interfaces/hooks.js';

import createGHA from '../createGHA/new.js';

type ParsedOpts = Record<string, unknown>;

export interface CreateGHAHookOptsInClass {
  parsedOpts?: ParsedOpts;
  result: string;
}

type CreateGHAHookOpts = {
  command: Command.Class;
  parsedOpts: ParsedOpts;
} & Omit<CreateGHAHookOptsInClass, 'parsedOpts'>;

export interface CreateGHAHook {
  createGHA: {
    options: CreateGHAHookOpts;
    return: string;
  };
}

const hook: Hook<'createGHA', CreateGHAHook & Hooks> = async function createGHAHook(options) {
  const msg = options.result;
  const command = options.command;
  const parsedOpts = options.parsedOpts;

  return createGHA.call(this, msg, command, parsedOpts);
};

export default hook;
