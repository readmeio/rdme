import type { CreateGHAHook, CreateGHAHookOptsInClass } from './hooks/createGHA.js';
import type { Config, Hook, Interfaces } from '@oclif/core';

import { format } from 'node:util';

import * as core from '@actions/core';
import { Command as OclifCommand } from '@oclif/core';

import { isGHA, isTest } from './isCI.js';

type Flags<T extends typeof OclifCommand> = Interfaces.InferredFlags<(typeof BaseCommand)['baseFlags'] & T['flags']>;
type Args<T extends typeof OclifCommand> = Interfaces.InferredArgs<T['args']>;

export default abstract class BaseCommand<T extends typeof OclifCommand> extends OclifCommand {
  constructor(argv: string[], config: Config) {
    super(argv, config);

    const oclifDebug = this.debug;
    // this scope is copied from the @oclif/core source
    const scope = this.id ? `${this.config.bin}:${this.id}` : this.config.bin;
    // this is a lightweight reimplementation of the @oclif/core debug function
    // with some debug logging functionality for github actions
    this.debug = (formatter: unknown, ...args: unknown[]) => {
      if (isGHA() && !isTest()) {
        core.debug(`${scope}: ${format(formatter, ...args)}`);
      }

      return oclifDebug(formatter, ...args);
    };
  }

  args!: Args<T>;

  flags!: Flags<T>;

  // we need the declare statement here since `debug` is a
  // protected property in the base oclif class
  declare debug: (...args: unknown[]) => void;

  abstract run(): Promise<string>;

  protected async catch(err: Error & { exitCode?: number }): Promise<unknown> {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err);
  }

  /**
   * This is a light wrapper around the oclif command's `_run` function
   * that takes the result and sets a GitHub step output parameter to the result
   * when being run from a GitHub Actions runner.
   */
  // eslint-disable-next-line no-underscore-dangle
  protected async _run<U>(): Promise<U> {
    // eslint-disable-next-line no-underscore-dangle
    const result: U = await super._run();
    if (isGHA() && result) {
      core.setOutput('rdme', result);
    }
    return result;
  }

  // copied from here: https://oclif.io/docs/base_class
  // we use this to standardize our parsing
  public async init(): Promise<void> {
    await super.init();
    const { args, flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      args: this.ctor.args,
      strict: this.ctor.strict,
    });

    this.debug('parsed flags: %o', flags);
    this.debug('parsed args: %o', args);
    this.flags = flags as Flags<T>;
    this.args = args as Args<T>;
  }

  runCreateGHAHook(opts: CreateGHAHookOptsInClass) {
    return this.config
      .runHook('createGHA', {
        command: this.ctor,
        parsedOpts: opts.parsedOpts || { ...this.args, ...this.flags },
        result: opts.result,
      })
      .then((res: Hook.Result<CreateGHAHook['createGHA']['return']>) => {
        const { successes, failures } = res;
        if (successes.length) return successes[0].result;
        if (failures.length) throw failures[0].error;
        this.debug('unable to process createGHA hook response', res);
        return opts.result;
      });
  }
}
