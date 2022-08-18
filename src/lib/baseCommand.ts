/* eslint-disable class-methods-use-this */
import type { OptionDefinition } from 'command-line-usage';

import { debug, info, warn } from './logger';

export type CommandOptions<T> = T & {
  key?: string;
  version?: string;
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
  command: string;

  usage: string;

  description: string;

  cmdCategory: CommandCategories;

  position: number;

  hiddenArgs: string[] = [];

  args: OptionDefinition[];

  run(opts: CommandOptions<{}>, requiresAuth?: boolean): void | Promise<string> {
    Command.debug(`command: ${this.command}`);
    Command.debug(`opts: ${JSON.stringify(opts)}`);

    if (requiresAuth) {
      if (!opts.key) {
        throw new Error('No project API key provided. Please use `--key`.');
      }
    }
  }

  getVersionArg() {
    return {
      name: 'version',
      type: String,
      description:
        'Project version. If running command in a CI environment and this option is not passed, the main project version will be used.',
    };
  }

  /**
   * Used in the versions:create and versions:update commands.
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
