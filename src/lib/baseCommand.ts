/* eslint-disable class-methods-use-this */
import type commands from '../cmds';
import type { CommandLineOptions } from 'command-line-args';
import type { OptionDefinition } from 'command-line-usage';

import chalk from 'chalk';

import configstore from './configstore';
import getStoredConfig from './getStoredConfig';
import isCI from './isCI';
import { debug, info, warn } from './logger';
import loginFlow from './loginFlow';

export type CommandOptions<T> = T & {
  key?: string;
  version?: string;
  github?: boolean;
} & CommandLineOptions;

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

export default class Command {
  /**
   * The command name
   *
   * @example openapi
   */
  command: keyof typeof commands;

  /**
   * Example command usage, used on invidivual command help screens
   *
   * @example openapi [file] [options]
   */
  usage: string;

  /**
   * The command description, used on help screens
   *
   * @example Upload, or resync, your OpenAPI/Swagger definition to ReadMe.
   */
  description: string;

  /**
   * The category that the command belongs to, used on
   * the general help screen to group commands together
   * and on individual command help screens
   * to show related commands
   *
   * @example CommandCategories.APIS
   */
  cmdCategory: CommandCategories;

  /**
   * Should the command be hidden from our `--help` screens?
   */
  hidden = false;

  /**
   * Does the command run the GitHub Actions onboarding called via
   * `src/index.ts`?
   */
  supportsGHA = false;

  /**
   * Arguments to hide from the individual command help screen
   * (typically used for hiding default arguments)
   *
   * @example ['spec']
   */
  hiddenArgs: string[] = [];

  /**
   * All documented arguments for the command
   */
  args: OptionDefinition[];

  async run(opts: CommandOptions<{}>): Promise<string> {
    Command.debug(`command: ${this.command}`);
    Command.debug(`opts: ${JSON.stringify(opts)}`);

    if (this.args.some(arg => arg.name === 'key')) {
      const { apiKey, email, project } = getStoredConfig();

      // We only want to log this if the API key is stored in the configstore, **not** in an env var.
      if (opts.key && configstore.get('apiKey') === opts.key) {
        info(
          `🔑 ${chalk.green(email)} is currently logged in, using the stored API key for this project: ${chalk.blue(
            project
          )}`,
          { includeEmojiPrefix: false }
        );
      }

      if (!opts.key) {
        if (isCI()) {
          throw new Error('No project API key provided. Please use `--key`.');
        }
        info("Looks like you're missing a ReadMe API key, let's fix that! 🦉", { includeEmojiPrefix: false });
        const result = await loginFlow();
        info(result, { includeEmojiPrefix: false });
        // if someone is logging in, we want to grab the value from the stored config, not the env
        // eslint-disable-next-line no-param-reassign
        opts.key = configstore.get('apiKey');
      }
    }

    if (opts.github && isCI()) {
      throw new Error('The `--github` flag is only for usage in non-CI environments.');
    }

    // This is a bit of a hack so we can keep our types consistent
    // for this `run` function.
    return Promise.resolve('');
  }

  /**
   * Used in any command where `github` is an option.
   */
  getGitHubArg(): OptionDefinition {
    return {
      name: 'github',
      type: Boolean,
      description: 'Create a new GitHub Actions workflow for this command.',
    };
  }

  /**
   * Used in any command where `key` is an option.
   */
  getKeyArg(): OptionDefinition {
    return {
      name: 'key',
      type: String,
      description: 'Project API key',
    };
  }

  /**
   * Used in any command where `version` is an option.
   */
  getVersionArg(): OptionDefinition {
    return {
      name: 'version',
      type: String,
      description:
        'Project version. If running command in a CI environment and this option is not passed, the main project version will be used.',
    };
  }

  /**
   * Used in the `versions:create` and `versions:update` commands.
   */
  getVersionOpts() {
    return [
      {
        name: 'codename',
        type: String,
        description: 'The codename, or nickname, for a particular version.',
      },
      {
        name: 'main',
        type: String,
        description:
          "Should this version be the primary (default) version for your project? (Must be 'true' or 'false')",
      },
      {
        name: 'beta',
        type: String,
        description: "Is this version in beta? (Must be 'true' or 'false')",
      },
      {
        name: 'isPublic',
        type: String,
        description:
          "Would you like to make this version public? Any primary version must be public. (Must be 'true' or 'false')",
      },
    ];
  }

  static debug(msg: string) {
    debug(msg);
  }

  static info(msg: string) {
    info(msg);
  }

  static warn(msg: string) {
    warn(msg);
  }
}
