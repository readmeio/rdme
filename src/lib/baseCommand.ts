import type { Config, Hook, Interfaces } from '@oclif/core';
import type { CreateGHAHook, CreateGHAHookOptsInClass } from './hooks/createGHA.js';

import { format } from 'node:util';

import * as core from '@actions/core';
import { Errors, Command as OclifCommand } from '@oclif/core';
import chalk from 'chalk';
import debugPkg from 'debug';

import { isGHA, isTest } from './isCI.js';
import { info } from './logger.js';
import { handleAPIv2Res, type ResponseBody, readmeAPIv2Fetch } from './readmeAPIFetch.js';

type Flags<T extends typeof OclifCommand> = Interfaces.InferredFlags<(typeof BaseCommand)['baseFlags'] & T['flags']>;
type Args<T extends typeof OclifCommand> = Interfaces.InferredArgs<T['args']>;

/**
 * This is a light wrapper around the oclif command class that adds some
 * additional functionality and standardizes the way we handle logging, error handling,
 * and API requests.
 *
 * @note This class is not meant to be used directly, but rather as a base class for other commands.
 * It is also experimental and may change in the future.
 */
export default abstract class BaseCommand<T extends typeof OclifCommand> extends OclifCommand {
  constructor(argv: string[], config: Config) {
    super(argv, config);

    // this scope is copied from the @oclif/core source
    // see https://github.com/oclif/core/blob/eef2ddedf6a844b28d8968ef5afd38c92f5875db/src/command.ts#L140
    const scope = this.id ? `${this.config.bin}:${this.id}` : this.config.bin;

    // rather than using the @oclif/core debug function, we use the debug package
    // so we have full control over the scope.
    const debug = debugPkg(scope);
    // this is a lightweight reimplementation of the @oclif/core debug function
    // with some debug logging functionality for github actions
    this.debug = (formatter: unknown, ...args: unknown[]) => {
      if (isGHA() && !isTest()) {
        core.debug(`${scope}: ${format(formatter, ...args)}`);
      }

      return debug(formatter, ...args);
    };
  }

  args!: Args<T>;

  flags!: Flags<T>;

  // we need the declare statement here since `debug` is a
  // protected property in the base oclif class
  declare debug: (...args: unknown[]) => void;

  protected info(input: Parameters<typeof info>[0], opts: Parameters<typeof info>[1]): void {
    if (!this.jsonEnabled()) {
      info(input, opts);
    }
  }

  public warn(input: Error | string): Error | string {
    if (!this.jsonEnabled()) {
      if (isGHA()) {
        core.warning(input);
      } else {
        Errors.warn(input);
      }
    }
    return input;
  }

  protected async catch(err: Error & { exitCode?: number }) {
    if (isTest()) {
      return super.catch(err);
    }

    let message = `Yikes, something went wrong! Please try again and if the problem persists, get in touch with our support team at ${chalk.underline(
      'support@readme.io',
    )}.`;

    if (err.message) {
      message = err.message;
    }

    /**
     * If we're in a GitHub Actions environment, log errors with that formatting instead.
     *
     * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-error-message}
     * @see {@link https://github.com/actions/toolkit/tree/main/packages/core#annotations}
     */
    if (isGHA()) {
      return core.setFailed(message);
    }

    // If this is a soft error then we should output the result as a regular log but exit the CLI
    // with an error status code.
    if (err.name === 'SoftError') {
      // biome-ignore lint/suspicious/noConsole: We are printing errors to the terminal.
      console.log(err.message);
    } else {
      // biome-ignore lint/suspicious/noConsole: We are printing errors to the terminal.
      console.error(chalk.red(`\n${message}\n`));
    }

    return process.exit(process.exitCode ?? err.exitCode ?? 1);
  }

  /**
   * This is a light wrapper around the oclif command's `_run` function
   * that takes the result and sets a GitHub step output parameter to the result
   * when being run from a GitHub Actions runner.
   */
  protected async _run<U>(): Promise<U> {
    const result: U = await super._run();
    if (isGHA() && !isTest() && result) {
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

  /**
   * Wrapper around `handleAPIv2Res` that binds the context of the class to the function.
   */
  public async handleAPIRes<R extends ResponseBody = ResponseBody>(...args: Parameters<typeof handleAPIv2Res>) {
    return handleAPIv2Res.call(this, ...args) as Promise<R>;
  }

  /**
   * Wrapper around `readmeAPIv2Fetch` that binds the context of the class to the function.
   */
  public async readmeAPIFetch(...args: Parameters<typeof readmeAPIv2Fetch>) {
    return readmeAPIv2Fetch.call(this, ...args);
  }

  async runCreateGHAHook(opts: CreateGHAHookOptsInClass) {
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
