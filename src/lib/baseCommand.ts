/* eslint-disable class-methods-use-this */
import type commands from '../cmds';
import type { OptionDefinition } from 'command-line-usage';

import isCI from './isCI';
import { debug, info, warn } from './logger';

export type CommandOptions<T> = T & {
  key?: string;
  version?: string;
  github?: boolean;
};

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
   * The order in which to display the command within the `cmdCategory`
   *
   * @example 1
   */
  position: number;

  /**
   * Should the command be hidden from our `--help` screens?
   */
  hidden = false;

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

  run(opts: CommandOptions<{}>): void | Promise<string> {
    Command.debug(`command: ${this.command}`);
    Command.debug(`opts: ${JSON.stringify(opts)}`);

    if (this.args.some(arg => arg.name === 'key')) {
      if (!opts.key) {
        throw new Error('No project API key provided. Please use `--key`.');
      }
    }

    if (opts.github && isCI()) {
      throw new Error('The `--github` flag is only for usage in non-CI environments.');
    }
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
        description: 'Should this version be the primary (default) version for your project?',
      },
      {
        name: 'beta',
        type: String,
        description: 'Is this version in beta?',
      },
      {
        name: 'isPublic',
        type: String,
        description: 'Would you like to make this version public? Any primary version must be public.',
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
