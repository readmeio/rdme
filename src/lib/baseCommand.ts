import type { OptionDefinition } from 'command-line-usage';

import { debug } from './logger';

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

  run(opts: CommandOptions<{}>): void | Promise<string> {
    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);
  }
}
