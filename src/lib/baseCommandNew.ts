import type { Interfaces } from '@oclif/core';

import { Command as OclifCommand } from '@oclif/core';
import chalk from 'chalk';

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

  // eslint-disable-next-line class-methods-use-this
  protected async catch(err: Error & { exitCode?: number }): Promise<unknown> {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    // return super.catch(err);

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
    // if (isGHA()) {
    //   return core.setFailed(message);
    // }

    // If this is a soft error then we should output the result as a regular log but exit the CLI
    // with an error status code.
    if (err.name === 'SoftError') {
      // eslint-disable-next-line no-console
      console.log(err.message);
    } else {
      // eslint-disable-next-line no-console
      console.error(chalk.red(`\n${message}\n`));
    }

    return process.exit(1);
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
}
