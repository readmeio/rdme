import type { CreateGHAHook, CreateGHAHookOptsInClass } from './hooks/createGHA.js';
import type { Hook, Interfaces } from '@oclif/core';

import { Command as OclifCommand } from '@oclif/core';

export enum CommandCategories {
  ADMIN = 'admin',
  APIS = 'apis',
  CATEGORIES = 'categories',
  CHANGELOGS = 'changelogs',
  CUSTOM_PAGES = 'custompages',
  DOCS = 'docs',
  UTILITIES = 'utilities',
  VERSIONS = 'versions',
}

export type Flags<T extends typeof OclifCommand> = Interfaces.InferredFlags<
  (typeof BaseCommand)['baseFlags'] & T['flags']
>;
export type Args<T extends typeof OclifCommand> = Interfaces.InferredArgs<T['args']>;

export default abstract class BaseCommand<T extends typeof OclifCommand> extends OclifCommand {
  /**
   * The category that the command belongs to, used on
   * the general help screen to group commands together
   * and on individual command help screens
   * to show related commands
   *
   * @example CommandCategories.APIS
   */
  cmdCategory!: CommandCategories;

  /**
   * Does the command run the GitHub Actions onboarding called via
   * `src/index.ts`?
   */
  supportsGHA = false;

  protected args!: Args<T>;

  protected flags!: Flags<T>;

  protected async catch(err: Error & { exitCode?: number }): Promise<unknown> {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err);
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
