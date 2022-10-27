import CategoriesCommand from './categories';
import CategoriesCreateCommand from './categories/create';
import ChangelogsCommand from './changelogs';
import SingleChangelogCommand from './changelogs/single';
import CustomPagesCommand from './custompages';
import SingleCustomPageCommand from './custompages/single';
import DocsCommand from './docs';
import DocsEditCommand from './docs/edit';
import DocsPruneCommand from './docs/prune';
import SingleDocCommand from './docs/single';
import LoginCommand from './login';
import LogoutCommand from './logout';
import OASCommand from './oas';
import OpenCommand from './open';
import OpenAPICommand from './openapi';
import OpenAPIReduceCommand from './openapi/reduce';
import OpenAPIValidateCommand from './openapi/validate';
import SwaggerCommand from './swagger';
import ValidateAliasCommand from './validate';
import VersionsCommand from './versions';
import CreateVersionCommand from './versions/create';
import DeleteVersionCommand from './versions/delete';
import UpdateVersionCommand from './versions/update';
import WhoAmICommand from './whoami';

const commands = {
  categories: CategoriesCommand,
  'categories:create': CategoriesCreateCommand,

  changelogs: ChangelogsCommand,
  'changelogs:single': SingleChangelogCommand,

  custompages: CustomPagesCommand,
  'custompages:single': SingleCustomPageCommand,

  docs: DocsCommand,
  'docs:prune': DocsPruneCommand,
  'docs:edit': DocsEditCommand,
  'docs:single': SingleDocCommand,

  versions: VersionsCommand,
  'versions:create': CreateVersionCommand,
  'versions:delete': DeleteVersionCommand,
  'versions:update': UpdateVersionCommand,

  login: LoginCommand,
  logout: LogoutCommand,
  oas: OASCommand,
  open: OpenCommand,
  openapi: OpenAPICommand,
  'openapi:reduce': OpenAPIReduceCommand,
  'openapi:validate': OpenAPIValidateCommand,
  swagger: SwaggerCommand,
  validate: ValidateAliasCommand,
  whoami: WhoAmICommand,
};

export default commands;
