`rdme openapi`
==============

Manage your API definition. Supports OpenAPI, Swagger, and Postman.

* [`rdme openapi [SPEC]`](#rdme-openapi-spec)
* [`rdme openapi:convert [SPEC]`](#rdme-openapiconvert-spec)
* [`rdme openapi:inspect [SPEC]`](#rdme-openapiinspect-spec)
* [`rdme openapi:reduce [SPEC]`](#rdme-openapireduce-spec)
* [`rdme openapi:validate [SPEC]`](#rdme-openapivalidate-spec)

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
  --key=<value>               (required) ReadMe Project API key
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
  $ rdme openapi:convert [SPEC] [--out <value>] [--title <value>] [--workingDirectory <value>]

ARGUMENTS
  SPEC  A file/URL to your API definition

FLAGS
  --out=<value>               Output file path to write converted file to
  --title=<value>             An override value for the `info.title` field in the API definition
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
    dme...] [--workingDirectory <value>]

ARGUMENTS
  SPEC  A file/URL to your API definition

FLAGS
  --feature=<option>...       A specific OpenAPI or ReadMe feature you wish to see detailed information on (if it
                              exists). If any features supplied do not exist within the API definition an exit(1) code
                              will be returned alongside the report.
                              <options: additionalProperties|callbacks|circularRefs|discriminators|links|style|polymorph
                              ism|serverVariables|webhooks|xml|readme>
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
```
