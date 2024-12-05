import ChangelogsCommand from './commands/changelogs.js';
import LoginCommand from './commands/login.js';
import LogoutCommand from './commands/logout.js';
import OpenAPIConvertCommand from './commands/openapi/convert.js';
import OpenAPICommand from './commands/openapi/index.js';
import OpenAPIInspectCommand from './commands/openapi/inspect.js';
import OpenAPIReduceCommand from './commands/openapi/reduce.js';
import OpenAPIValidateCommand from './commands/openapi/validate.js';
import WhoAmICommand from './commands/whoami.js';

export { default as createGHA } from './lib/hooks/createGHA.js';
export { default as prerun } from './lib/hooks/prerun.js';

export const COMMANDS = {
  changelogs: ChangelogsCommand,

  login: LoginCommand,
  logout: LogoutCommand,

  openapi: OpenAPICommand,
  'openapi:convert': OpenAPIConvertCommand,
  'openapi:inspect': OpenAPIInspectCommand,
  'openapi:reduce': OpenAPIReduceCommand,
  'openapi:validate': OpenAPIValidateCommand,

  whoami: WhoAmICommand,
};
