# Table of contents

  <!-- toc -->
* [Table of contents](#table-of-contents)
* [Example Usage](#example-usage)
* [Command Reference](#command-reference)
<!-- tocstop -->

# Example Usage

  <!-- usage -->
```sh-session
$ npm install -g rdme
$ rdme COMMAND
running command...
$ rdme (--version)
rdme/9.0.0-next.21 darwin-arm64 node-v22.11.0
$ rdme --help [COMMAND]
USAGE
  $ rdme COMMAND
...
```
<!-- usagestop -->

# Command Reference

  <!-- commands -->
* [`rdme autocomplete [SHELL]`](#rdme-autocomplete-shell)
* [`rdme categories`](#rdme-categories)
* [`rdme categories:create TITLE`](#rdme-categoriescreate-title)
* [`rdme changelogs PATH`](#rdme-changelogs-path)
* [`rdme custompages PATH`](#rdme-custompages-path)
* [`rdme docs PATH`](#rdme-docs-path)
* [`rdme docs:prune FOLDER`](#rdme-docsprune-folder)
* [`rdme help [COMMAND]`](#rdme-help-command)
* [`rdme login`](#rdme-login)
* [`rdme logout`](#rdme-logout)
* [`rdme open`](#rdme-open)
* [`rdme openapi [SPEC]`](#rdme-openapi-spec)
* [`rdme openapi:convert [SPEC]`](#rdme-openapiconvert-spec)
* [`rdme openapi:inspect [SPEC]`](#rdme-openapiinspect-spec)
* [`rdme openapi:reduce [SPEC]`](#rdme-openapireduce-spec)
* [`rdme openapi:validate [SPEC]`](#rdme-openapivalidate-spec)
* [`rdme versions`](#rdme-versions)
* [`rdme versions:create VERSION`](#rdme-versionscreate-version)
* [`rdme versions:delete [VERSION]`](#rdme-versionsdelete-version)
* [`rdme versions:update [VERSION]`](#rdme-versionsupdate-version)
* [`rdme whoami`](#rdme-whoami)

## `rdme autocomplete [SHELL]`

Display autocomplete installation instructions.

```
USAGE
  $ rdme autocomplete [SHELL] [-r]

ARGUMENTS
  SHELL  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  Display autocomplete installation instructions.

EXAMPLES
  $ rdme autocomplete

  $ rdme autocomplete bash

  $ rdme autocomplete zsh

  $ rdme autocomplete powershell

  $ rdme autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v3.2.8/src/commands/autocomplete/index.ts)_

## `rdme categories`

Get all categories in your ReadMe project.

```
USAGE
  $ rdme categories --key <value> [--version <value>]

FLAGS
  --key=<value>      (required) Project API key
  --version=<value>  Project version. If running command in a CI environment and this option is not passed, the main
                     project version will be used.

DESCRIPTION
  Get all categories in your ReadMe project.
```

## `rdme categories:create TITLE`

Create a category with the specified title and guide in your ReadMe project.

```
USAGE
  $ rdme categories:create TITLE --categoryType guide|reference --key <value> [--preventDuplicates] [--version <value>]

ARGUMENTS
  TITLE  Title of the category

FLAGS
  --categoryType=<option>  (required) Category type
                           <options: guide|reference>
  --key=<value>            (required) Project API key
  --preventDuplicates      Prevents the creation of a new category if there is an existing category with a matching
                           `categoryType` and `title`
  --version=<value>        Project version. If running command in a CI environment and this option is not passed, the
                           main project version will be used.

DESCRIPTION
  Create a category with the specified title and guide in your ReadMe project.
```

## `rdme changelogs PATH`

Sync Markdown files to your ReadMe project as Changelog posts. Can either be a path to a directory or a single Markdown file.

```
USAGE
  $ rdme changelogs PATH --key <value> [--github] [--dryRun]

ARGUMENTS
  PATH  Path to a local Markdown file or folder of Markdown files.

FLAGS
  --dryRun       Runs the command without creating/updating any changelogs in ReadMe. Useful for debugging.
  --github       Create a new GitHub Actions workflow for this command.
  --key=<value>  (required) Project API key

DESCRIPTION
  Sync Markdown files to your ReadMe project as Changelog posts. Can either be a path to a directory or a single
  Markdown file.
```

## `rdme custompages PATH`

Sync Markdown/HTML files to your ReadMe project as Custom Pages. Can either be a path to a directory or a single Markdown/HTML file.

```
USAGE
  $ rdme custompages PATH --key <value> [--github] [--dryRun]

ARGUMENTS
  PATH  Path to a local Markdown file or folder of Markdown files.

FLAGS
  --dryRun       Runs the command without creating/updating any custom pages in ReadMe. Useful for debugging.
  --github       Create a new GitHub Actions workflow for this command.
  --key=<value>  (required) Project API key

DESCRIPTION
  Sync Markdown/HTML files to your ReadMe project as Custom Pages. Can either be a path to a directory or a single
  Markdown/HTML file.
```

## `rdme docs PATH`

Sync Markdown files to your ReadMe project as Guides. Can either be a path to a directory or a single Markdown file.

```
USAGE
  $ rdme docs PATH --key <value> [--version <value>] [--github] [--dryRun]

ARGUMENTS
  PATH  Path to a local Markdown file or folder of Markdown files.

FLAGS
  --dryRun           Runs the command without creating/updating any docs in ReadMe. Useful for debugging.
  --github           Create a new GitHub Actions workflow for this command.
  --key=<value>      (required) Project API key
  --version=<value>  Project version. If running command in a CI environment and this option is not passed, the main
                     project version will be used.

DESCRIPTION
  Sync Markdown files to your ReadMe project as Guides. Can either be a path to a directory or a single Markdown file.

ALIASES
  $ rdme guides
```

## `rdme docs:prune FOLDER`

Delete any docs from ReadMe if their slugs are not found in the target folder.

```
USAGE
  $ rdme docs:prune FOLDER --key <value> [--version <value>] [--github] [--confirm] [--dryRun]

ARGUMENTS
  FOLDER  A local folder containing the files you wish to prune.

FLAGS
  --confirm          Bypass the confirmation prompt. Useful for CI environments.
  --dryRun           Runs the command without deleting any docs in ReadMe. Useful for debugging.
  --github           Create a new GitHub Actions workflow for this command.
  --key=<value>      (required) Project API key
  --version=<value>  Project version. If running command in a CI environment and this option is not passed, the main
                     project version will be used.

DESCRIPTION
  Delete any docs from ReadMe if their slugs are not found in the target folder.

ALIASES
  $ rdme guides:prune
```

## `rdme help [COMMAND]`

Display help for rdme.

```
USAGE
  $ rdme help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for rdme.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.17/src/commands/help.ts)_

## `rdme login`

Login to a ReadMe project.

```
USAGE
  $ rdme login [--email <value>] [--password <value>] [--otp <value>] [--project <value>]

FLAGS
  --email=<value>     Your email address
  --otp=<value>       Your one-time password (if you have two-factor authentication enabled)
  --password=<value>  Your password
  --project=<value>   The subdomain of the project you wish to log into

DESCRIPTION
  Login to a ReadMe project.
```

## `rdme logout`

Logs the currently authenticated user out of ReadMe.

```
USAGE
  $ rdme logout

DESCRIPTION
  Logs the currently authenticated user out of ReadMe.
```

## `rdme open`

Open your current ReadMe project in the browser.

```
USAGE
  $ rdme open [--dash]

FLAGS
  --dash  Opens your current ReadMe project dashboard.

DESCRIPTION
  Open your current ReadMe project in the browser.
```

## `rdme openapi [SPEC]`

Upload, or resync, your OpenAPI/Swagger definition to ReadMe.

```
USAGE
  $ rdme openapi [SPEC] --key <value> [--version <value>] [--id <value>] [--title <value>]
    [--workingDirectory <value>] [--github] [--dryRun] [--useSpecVersion] [--raw] [--create | --update]

ARGUMENTS
  SPEC  A file/URL to your API definition

FLAGS
  --create                    Bypasses the create/update prompt and creates a new API definition in ReadMe.
  --dryRun                    Runs the command without creating/updating any API Definitions in ReadMe. Useful for
                              debugging.
  --github                    Create a new GitHub Actions workflow for this command.
  --id=<value>                Unique identifier for your API definition. Use this if you're re-uploading an existing API
                              definition.
  --key=<value>               (required) Project API key
  --raw                       Return the command results as a JSON object instead of a pretty output.
  --title=<value>             An override value for the `info.title` field in the API definition
  --update                    Bypasses the create/update prompt and automatically updates an existing API definition in
                              ReadMe.
  --useSpecVersion            Uses the version listed in the `info.version` field in the API definition for the project
                              version parameter.
  --version=<value>           Project version. If running command in a CI environment and this option is not passed, the
                              main project version will be used.
  --workingDirectory=<value>  Working directory (for usage with relative external references)

DESCRIPTION
  Upload, or resync, your OpenAPI/Swagger definition to ReadMe.

FLAG DESCRIPTIONS
  --update  Bypasses the create/update prompt and automatically updates an existing API definition in ReadMe.

    Bypasses the create/update prompt and automatically updates an existing API definition in ReadMe. Note that this
    flag only works if there's only one API definition associated with the current version.
```

## `rdme openapi:convert [SPEC]`

Convert an API definition to OpenAPI and bundle any external references.

```
USAGE
  $ rdme openapi:convert [SPEC] [--out <value>] [--workingDirectory <value>]

ARGUMENTS
  SPEC  A file/URL to your API definition

FLAGS
  --out=<value>               Output file path to write converted file to
  --workingDirectory=<value>  Working directory (for usage with relative external references)

DESCRIPTION
  Convert an API definition to OpenAPI and bundle any external references.
```

## `rdme openapi:inspect [SPEC]`

Analyze an OpenAPI/Swagger definition for various OpenAPI and ReadMe feature usage.

```
USAGE
  $ rdme openapi:inspect [SPEC] [--feature
    additionalProperties|callbacks|circularRefs|discriminators|links|style|polymorphism|serverVariables|webhooks|xml|rea
    dme...] [--title <value>] [--workingDirectory <value>]

ARGUMENTS
  SPEC  A file/URL to your API definition

FLAGS
  --feature=<option>...       A specific OpenAPI or ReadMe feature you wish to see detailed information on (if it
                              exists). If any features supplied do not exist within the API definition an exit(1) code
                              will be returned alongside the report.
                              <options: additionalProperties|callbacks|circularRefs|discriminators|links|style|polymorph
                              ism|serverVariables|webhooks|xml|readme>
  --title=<value>             An override value for the `info.title` field in the API definition
  --workingDirectory=<value>  Working directory (for usage with relative external references)

DESCRIPTION
  Analyze an OpenAPI/Swagger definition for various OpenAPI and ReadMe feature usage.
```

## `rdme openapi:reduce [SPEC]`

Reduce an OpenAPI definition into a smaller subset.

```
USAGE
  $ rdme openapi:reduce [SPEC] [--method <value>...] [--out <value>] [--path <value>...] [--tag <value>...] [--title
    <value>] [--workingDirectory <value>]

ARGUMENTS
  SPEC  A file/URL to your API definition

FLAGS
  --method=<value>...         Methods to reduce by (can only be used alongside the `path` option)
  --out=<value>               Output file path to write reduced file to
  --path=<value>...           Paths to reduce by
  --tag=<value>...            Tags to reduce by
  --title=<value>             An override value for the `info.title` field in the API definition
  --workingDirectory=<value>  Working directory (for usage with relative external references)

DESCRIPTION
  Reduce an OpenAPI definition into a smaller subset.
```

## `rdme openapi:validate [SPEC]`

Validate your OpenAPI/Swagger definition.

```
USAGE
  $ rdme openapi:validate [SPEC] [--github] [--workingDirectory <value>]

ARGUMENTS
  SPEC  A file/URL to your API definition

FLAGS
  --github                    Create a new GitHub Actions workflow for this command.
  --workingDirectory=<value>  Working directory (for usage with relative external references)

DESCRIPTION
  Validate your OpenAPI/Swagger definition.

ALIASES
  $ rdme validate
```

## `rdme versions`

List versions available in your project or get a version by SemVer (https://semver.org/).

```
USAGE
  $ rdme versions --key <value> [--version <value>]

FLAGS
  --key=<value>      (required) Project API key
  --version=<value>  A specific project version to view.

DESCRIPTION
  List versions available in your project or get a version by SemVer (https://semver.org/).
```

## `rdme versions:create VERSION`

Create a new version for your project.

```
USAGE
  $ rdme versions:create VERSION --key <value> [--fork <value>] [--codename <value>] [--main true|false] [--beta
    true|false] [--deprecated true|false] [--hidden true|false]

ARGUMENTS
  VERSION  The version you'd like to create. Must be valid SemVer (https://semver.org/)

FLAGS
  --beta=<option>        Should this version be in beta?
                         <options: true|false>
  --codename=<value>     The codename, or nickname, for a particular version.
  --deprecated=<option>  Should this version be deprecated? The main version cannot be deprecated.
                         <options: true|false>
  --fork=<value>         The semantic version which you'd like to fork from.
  --hidden=<option>      Should this version be hidden? The main version cannot be hidden.
                         <options: true|false>
  --key=<value>          (required) Project API key
  --main=<option>        Should this be the main version for your project?
                         <options: true|false>

DESCRIPTION
  Create a new version for your project.
```

## `rdme versions:delete [VERSION]`

Delete a version associated with your ReadMe project.

```
USAGE
  $ rdme versions:delete [VERSION] --key <value>

ARGUMENTS
  VERSION  The version you'd like to delete.

FLAGS
  --key=<value>  (required) Project API key

DESCRIPTION
  Delete a version associated with your ReadMe project.
```

## `rdme versions:update [VERSION]`

Update an existing version for your project.

```
USAGE
  $ rdme versions:update [VERSION] --key <value> [--newVersion <value>] [--codename <value>] [--main true|false]
    [--beta true|false] [--deprecated true|false] [--hidden true|false]

ARGUMENTS
  VERSION  The existing version you'd like to update.

FLAGS
  --beta=<option>        Should this version be in beta?
                         <options: true|false>
  --codename=<value>     The codename, or nickname, for a particular version.
  --deprecated=<option>  Should this version be deprecated? The main version cannot be deprecated.
                         <options: true|false>
  --hidden=<option>      Should this version be hidden? The main version cannot be hidden.
                         <options: true|false>
  --key=<value>          (required) Project API key
  --main=<option>        Should this be the main version for your project?
                         <options: true|false>
  --newVersion=<value>   What should the version be renamed to?

DESCRIPTION
  Update an existing version for your project.
```

## `rdme whoami`

Displays the current user and project authenticated with ReadMe.

```
USAGE
  $ rdme whoami

DESCRIPTION
  Displays the current user and project authenticated with ReadMe.
```
<!-- commandsstop -->
