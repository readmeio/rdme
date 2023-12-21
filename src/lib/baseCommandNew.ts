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

export default abstract class BaseCommand extends OclifCommand {
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
}
