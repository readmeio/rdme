import type { ValueOf } from 'type-fest';

import ChangelogsCommand from './commands/changelogs.js';
import DocsMigrateCommand from './commands/docs/migrate.js';
import DocsUploadCommand from './commands/docs/upload.js';
import LoginCommand from './commands/login.js';
import LogoutCommand from './commands/logout.js';
import OpenAPIConvertCommand from './commands/openapi/convert.js';
import OpenAPIInspectCommand from './commands/openapi/inspect.js';
import OpenAPIReduceCommand from './commands/openapi/reduce.js';
import OpenAPIUploadCommand from './commands/openapi/upload.js';
import OpenAPIValidateCommand from './commands/openapi/validate.js';
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
  changelogs: ChangelogsCommand,

  'docs:migrate': DocsMigrateCommand,
  'docs:upload': DocsUploadCommand,

  login: LoginCommand,
  logout: LogoutCommand,

  'openapi:convert': OpenAPIConvertCommand,
  'openapi:inspect': OpenAPIInspectCommand,
  'openapi:reduce': OpenAPIReduceCommand,
  'openapi:upload': OpenAPIUploadCommand,
  'openapi:validate': OpenAPIValidateCommand,

  whoami: WhoAmICommand,
};

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
