/** biome-ignore-all lint/performance/noBarrelFile: this barrel file is being exported for use in oclif + plugins */

import type { ValueOf } from 'type-fest';

import ChangelogUploadCommand from './commands/changelog/upload.js';
import ChangelogsCommand from './commands/changelogs.js';
import CustomPagesUploadCommand from './commands/custompages/upload.js';
import DocsMigrateCommand from './commands/docs/migrate.js';
import DocsUploadCommand from './commands/docs/upload.js';
import LoginCommand from './commands/login.js';
import LogoutCommand from './commands/logout.js';
import OpenAPIConvertCommand from './commands/openapi/convert.js';
import OpenAPIInspectCommand from './commands/openapi/inspect.js';
import OpenAPIReduceCommand from './commands/openapi/reduce.js';
import OpenAPIResolveCommand from './commands/openapi/resolve.js';
import OpenAPIUploadCommand from './commands/openapi/upload.js';
import OpenAPIValidateCommand from './commands/openapi/validate.js';
import RageCommand from './commands/rage.js';
import RefUploadCommand from './commands/reference/upload.js';
import WhoAmICommand from './commands/whoami.js';

export { default as createGHA } from './lib/hooks/createGHA.js';
export { default as prerun } from './lib/hooks/prerun.js';

/**
 * All the commands available in the CLI. We use the `explicit` command discovery strategy
 * so we can properly bundle the CLI for usage in GitHub Actions.
 *
 * Also, we use colon separators for subcommands below. This ensures that users can use both colons
 * and spaces when running subcommands. The documentation will always show spaces, but colons are
 * also supported.
 *
 * @see {@link https://oclif.io/docs/command_discovery_strategies/#explicit-strategy}
 */
export const COMMANDS = {
  'changelog:upload': ChangelogUploadCommand,

  /**
   * @deprecated
   */
  changelogs: ChangelogsCommand,

  'custompages:upload': CustomPagesUploadCommand,

  'docs:migrate': DocsMigrateCommand,
  'docs:upload': DocsUploadCommand,

  login: LoginCommand,
  logout: LogoutCommand,

  'openapi:convert': OpenAPIConvertCommand,
  'openapi:inspect': OpenAPIInspectCommand,
  'openapi:reduce': OpenAPIReduceCommand,
  'openapi:resolve': OpenAPIResolveCommand,
  'openapi:upload': OpenAPIUploadCommand,
  'openapi:validate': OpenAPIValidateCommand,

  rage: RageCommand,

  'reference:upload': RefUploadCommand,

  whoami: WhoAmICommand,
} as const;

export type CommandClass = ValueOf<typeof COMMANDS>;

/**
 * A type-safe way to get the command IDs in the CLI for a specific topic.
 *
 * @example type OpenAPIAction = CommandIdForTopic<'openapi'>;
 */
export type CommandIdForTopic<
  T extends 'openapi',
  U extends keyof typeof COMMANDS = keyof typeof COMMANDS,
> = U extends `${T}:${infer Suffix}` ? `${Suffix}` : never;

/**
 * Commands that leverage the APIv2 representations for uploading pages
 * (e.g., Guides, API Reference, etc.).
 *
 * Right now this is only the `docs upload` command, but in the future, we'll be adding
 * support for the API Reference and other page types.
 *
 * Note that the `changelogs` command is not included here
 * because it is backed by APIv1.
 */
export type APIv2PageUploadCommands =
  | ChangelogUploadCommand
  | CustomPagesUploadCommand
  | DocsUploadCommand
  | RefUploadCommand;

/**
 * Commands that leverage the APIv2 representations for interfacing with pages
 * (e.g., Guides, API Reference, etc.).
 *
 * These commands can do more than just upload pages, but they are all backed by the APIv2 representations.
 */
export type APIv2PageCommands = APIv2PageUploadCommands | DocsMigrateCommand;

/**
 * Every command that deals with OpenAPI definitions.
 */
export type OpenAPICommands =
  | OpenAPIConvertCommand
  | OpenAPIInspectCommand
  | OpenAPIReduceCommand
  | OpenAPIResolveCommand
  | OpenAPIUploadCommand
  | OpenAPIValidateCommand;
