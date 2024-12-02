import CategoriesCreateCommand from './commands/categories/create.js';
import CategoriesCommand from './commands/categories/index.js';
import ChangelogsCommand from './commands/changelogs.js';
import CustomPagesCommand from './commands/custompages.js';
import DocsCommand from './commands/docs/index.js';
import DocsPruneCommand from './commands/docs/prune.js';
import LoginCommand from './commands/login.js';
import LogoutCommand from './commands/logout.js';
import OpenCommand from './commands/open.js';
import OpenAPIConvertCommand from './commands/openapi/convert.js';
import OpenAPICommand from './commands/openapi/index.js';
import OpenAPIInspectCommand from './commands/openapi/inspect.js';
import OpenAPIReduceCommand from './commands/openapi/reduce.js';
import OpenAPIRefsCommand from './commands/openapi/refs.js';
import OpenAPIValidateCommand from './commands/openapi/validate.js';
import CreateVersionCommand from './commands/versions/create.js';
import DeleteVersionCommand from './commands/versions/delete.js';
import VersionsCommand from './commands/versions/index.js';
import UpdateVersionCommand from './commands/versions/update.js';
import WhoAmICommand from './commands/whoami.js';

export { default as createGHA } from './lib/hooks/createGHA.js';
export { default as prerun } from './lib/hooks/prerun.js';

export const COMMANDS = {
  categories: CategoriesCommand,
  'categories:create': CategoriesCreateCommand,

  changelogs: ChangelogsCommand,
  custompages: CustomPagesCommand,

  docs: DocsCommand,
  'docs:prune': DocsPruneCommand,

  versions: VersionsCommand,
  'versions:create': CreateVersionCommand,
  'versions:delete': DeleteVersionCommand,
  'versions:update': UpdateVersionCommand,

  login: LoginCommand,
  logout: LogoutCommand,
  open: OpenCommand,

  openapi: OpenAPICommand,
  'openapi:convert': OpenAPIConvertCommand,
  'openapi:inspect': OpenAPIInspectCommand,
  'openapi:reduce': OpenAPIReduceCommand,
  'openapi:refs': OpenAPIRefsCommand,
  'openapi:validate': OpenAPIValidateCommand,

  whoami: WhoAmICommand,
};
