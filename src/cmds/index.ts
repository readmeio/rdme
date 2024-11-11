import CategoriesCreateCommand from './categories/create.js';
import CategoriesCommand from './categories/index.js';
import ChangelogsCommand from './changelogs.js';
import CustomPagesCommand from './custompages.js';
import DocsCommand from './docs/index.js';
import DocsPruneCommand from './docs/prune.js';
import GuidesCommand from './guides/index.js';
import GuidesPruneCommand from './guides/prune.js';
import LoginCommand from './login.js';
import LogoutCommand from './logout.js';
import OpenCommand from './open.js';
import OpenAPIConvertCommand from './openapi/convert.js';
import OpenAPICommand from './openapi/index.js';
import OpenAPIInspectCommand from './openapi/inspect.js';
import OpenAPIReduceCommand from './openapi/reduce.js';
import OpenAPISolvingCircularityAndRecursiveness from './openapi/refs.js';
import OpenAPIValidateCommand from './openapi/validate.js';
import ValidateAliasCommand from './validate.js';
import CreateVersionCommand from './versions/create.js';
import DeleteVersionCommand from './versions/delete.js';
import VersionsCommand from './versions/index.js';
import UpdateVersionCommand from './versions/update.js';
import WhoAmICommand from './whoami.js';

const commands = {
  categories: CategoriesCommand,
  'categories:create': CategoriesCreateCommand,

  changelogs: ChangelogsCommand,
  custompages: CustomPagesCommand,

  docs: DocsCommand,
  'docs:prune': DocsPruneCommand,
  guides: GuidesCommand,
  'guides:prune': GuidesPruneCommand,

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
  'openapi:validate': OpenAPIValidateCommand,
  'openapi:refs': OpenAPISolvingCircularityAndRecursiveness,

  validate: ValidateAliasCommand,
  whoami: WhoAmICommand,
};

export default commands;
