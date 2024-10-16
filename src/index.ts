import CategoriesCreateCommand from "./cmds/categories/create.js";
import CategoriesCommand from "./cmds/categories/index.js";
import ChangelogsCommand from "./cmds/changelogs.js";
import CustomPagesCommand from "./cmds/custompages.js";
import DocsCommand from "./cmds/docs/index.js";
import DocsPruneCommand from "./cmds/docs/prune.js";
import LoginCommand from "./cmds/login.js";
import LogoutCommand from "./cmds/logout.js";
import OpenCommand from "./cmds/open.js";
import OpenAPIConvertCommand from "./cmds/openapi/convert.js";
import OpenAPICommand from "./cmds/openapi/index.js";
import OpenAPIInspectCommand from "./cmds/openapi/inspect.js";
import OpenAPIReduceCommand from "./cmds/openapi/reduce.js";
import OpenAPIValidateCommand from "./cmds/openapi/validate.js";
import CreateVersionCommand from "./cmds/versions/create.js";
import DeleteVersionCommand from "./cmds/versions/delete.js";
import VersionsCommand from "./cmds/versions/index.js";
import UpdateVersionCommand from "./cmds/versions/update.js";
import WhoAmICommand from "./cmds/whoami.js";

export { default as createGHA } from "./lib/hooks/createGHA.js";
export { default as prerun } from "./lib/hooks/prerun.js";

export const COMMANDS = {
  categories: CategoriesCommand,
  "categories:create": CategoriesCreateCommand,

  changelogs: ChangelogsCommand,
  custompages: CustomPagesCommand,

  docs: DocsCommand,
  "docs:prune": DocsPruneCommand,

  versions: VersionsCommand,
  "versions:create": CreateVersionCommand,
  "versions:delete": DeleteVersionCommand,
  "versions:update": UpdateVersionCommand,

  login: LoginCommand,
  logout: LogoutCommand,
  open: OpenCommand,

  openapi: OpenAPICommand,
  "openapi:convert": OpenAPIConvertCommand,
  "openapi:inspect": OpenAPIInspectCommand,
  "openapi:reduce": OpenAPIReduceCommand,
  "openapi:validate": OpenAPIValidateCommand,

  whoami: WhoAmICommand,
};
