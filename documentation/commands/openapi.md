`rdme openapi`
==============

Manage your API definition (e.g., syncing, validation, analysis, conversion, etc.). Supports OpenAPI, Swagger, and Postman collections, in either JSON or YAML formats.

* [`rdme openapi [SPEC]`](#rdme-openapi-spec)
* [`rdme openapi convert [SPEC]`](#rdme-openapi-convert-spec)
* [`rdme openapi inspect [SPEC]`](#rdme-openapi-inspect-spec)
* [`rdme openapi reduce [SPEC]`](#rdme-openapi-reduce-spec)
* [`rdme openapi refs [SPEC]`](#rdme-openapi-refs-spec)
* [`rdme openapi validate [SPEC]`](#rdme-openapi-validate-spec)

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
  --key=<value>               (required) An API key for your ReadMe project. Note that API authentication is required
                              despite being omitted from the example usage. See our docs for more information:
                              https://github.com/readmeio/rdme/tree/v9#authentication
  --raw                       Return the command results as a JSON object instead of a pretty output.
  --title=<value>             An override value for the `info.title` field in the API definition
  --update                    Bypasses the create/update prompt and automatically updates an existing API definition in
                              ReadMe.
  --useSpecVersion            Uses the version listed in the `info.version` field in the API definition for the project
                              version parameter.
  --version=<value>           ReadMe project version
  --workingDirectory=<value>  Working directory (for usage with relative external references)

DESCRIPTION
  Upload, or resync, your OpenAPI/Swagger definition to ReadMe.

  Locates your API definition (if you don't supply one), validates it, and then syncs it to your API reference on
  ReadMe.

EXAMPLES
  This will upload the API definition at the given URL or path to your project and return an ID and URL for you to
  later update your file, and view it in the client:

    $ rdme openapi [url-or-local-path-to-file]

  You can omit the file name and `rdme` will scan your working directory (and any subdirectories) for OpenAPI/Swagger
  files. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.

    $ rdme openapi

  If you want to bypass the prompt to create or update an API definition, you can pass the `--create` flag:

    $ rdme openapi [url-or-local-path-to-file] --version={project-version} --create

  This will edit (re-sync) an existing API definition (identified by `--id`) within your ReadMe project. **This is the
  recommended approach for usage in CI environments.**

    $ rdme openapi [url-or-local-path-to-file] --id={existing-api-definition-id}

  Alternatively, you can include a version flag, which specifies the target version for your file's destination. This
  approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.

    $ rdme openapi [url-or-local-path-to-file] --id={existing-api-definition-id}

  If you wish to programmatically access any of this script's results (such as the API definition ID or the link to
  the corresponding docs in your dashboard), supply the `--raw` flag and the command will return a JSON output:

    $ rdme openapi openapi.json --id={existing-api-definition-id} --raw

  You can also pass in a file in a subdirectory (we recommend running the CLI from the root of your repository if
  possible):

    $ rdme openapi example-directory/petstore.json

  By default, `rdme` bundles all references with paths based on the directory that it is being run in. You can
  override the working directory using the `--workingDirectory` option, which can be helpful for bundling certain
  external references:

    $ rdme openapi petstore.json --workingDirectory=[path to directory]

  If you wish to use the version specified in the `info.version` field of your OpenAPI definition, you can pass the
  `--useSpecVersion` option. So if the the `info.version` field was `1.2.3`, this is equivalent to passing
  `--version=1.2.3`.

    $ rdme openapi [url-or-local-path-to-file] --useSpecVersion

  If there's only one API definition for the given project version to update, you can use the `--update` flag and it
  will select it without any prompts:

    $ rdme openapi [url-or-local-path-to-file] --version={project-version} --update

FLAG DESCRIPTIONS
  --key=<value>

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v9#authentication

    ReadMe project API key

  --update  Bypasses the create/update prompt and automatically updates an existing API definition in ReadMe.

    Note that this flag only works if there's only one API definition associated with the current version.

  --version=<value>  ReadMe project version

    If running command in a CI environment and this option is not passed, the main project version will be used. See our
    docs for more information: https://docs.readme.com/main/docs/versions
```

## `rdme openapi convert [SPEC]`

Converts an API definition to OpenAPI and bundles any external references.

```
USAGE
  $ rdme openapi convert [SPEC] [--out <value>] [--title <value>] [--workingDirectory <value>]

ARGUMENTS
  SPEC  A file/URL to your API definition

FLAGS
  --out=<value>               Output file path to write converted file to
  --title=<value>             An override value for the `info.title` field in the API definition
  --workingDirectory=<value>  Working directory (for usage with relative external references)

DESCRIPTION
  Converts an API definition to OpenAPI and bundles any external references.

  Converts Swagger files and Postman collections to OpenAPI and bundles any external references. **Note**: All of our
  other OpenAPI commands already do this conversion automatically, but this command is available in case you need this
  functionality exclusively.

EXAMPLES
  By default, this command will display a comprehensive table of all OpenAPI and ReadMe features found in your API
  definition:

    $ rdme openapi convert [url-or-local-path-to-file]

  You can omit the file name and `rdme` will scan your working directory (and any subdirectories) for OpenAPI/Swagger
  files. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.

    $ rdme openapi convert
```

## `rdme openapi inspect [SPEC]`

Analyze an OpenAPI/Swagger definition for various OpenAPI and ReadMe feature usage.

```
USAGE
  $ rdme openapi inspect [SPEC] [--feature
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

  This command will perform a comprehensive analysis of your API definition to determine how it's utilizing aspects of
  the OpenAPI Specification (such as circular references, polymorphism, etc.) and any ReadMe-specific extensions you
  might be using.

EXAMPLES
  By default, this command will display a comprehensive table of all OpenAPI and ReadMe features found in your API
  definition:

    $ rdme openapi inspect [url-or-local-path-to-file]

  You can omit the file name and `rdme` will scan your working directory (and any subdirectories) for OpenAPI/Swagger
  files. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.

    $ rdme openapi inspect

  If you wish to automate this command, it contains a `--feature` flag so you can filter for one or several specific
  features. If you pass in one or more `--feature` flags, the command returns a `0` exit code if your definition
  contains all of the given features and a `1` exit code if your definition lacks any of the given features:

    $ rdme openapi inspect [url-or-local-path-to-file] --feature circularRefs --feature polymorphism
```

## `rdme openapi reduce [SPEC]`

Reduce an OpenAPI definition into a smaller subset.

```
USAGE
  $ rdme openapi reduce [SPEC] [--method <value>...] [--out <value>] [--path <value>...] [--tag <value>...] [--title
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

  Reduce your API definition down to a specific set of tags or paths, which can be useful if you're debugging a
  problematic schema somewhere, or if you have a file that is too big to maintain.

EXAMPLES
  By default, this command will ask you a couple questions about how you wish to reduce the file and then do so:

    $ rdme openapi reduce [url-or-local-path-to-file]

  You can omit the file name and `rdme` will scan your working directory (and any subdirectories) for OpenAPI/Swagger
  files. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.

    $ rdme openapi reduce

  If you wish to automate this command, you can pass in CLI arguments to bypass the prompts:

    $ rdme openapi reduce petstore.json --path /pet/{id} --method get --method put --out petstore.reduced.json
```

## `rdme openapi refs [SPEC]`

Resolves circular and recursive references in OpenAPI by replacing them with object schemas.

```
USAGE
  $ rdme openapi refs [SPEC] [--out <value>] [--workingDirectory <value>]

ARGUMENTS
  SPEC  A file/URL to your API definition

FLAGS
  --out=<value>               Output file path to write processed file to
  --workingDirectory=<value>  Working directory (for usage with relative external references)

DESCRIPTION
  Resolves circular and recursive references in OpenAPI by replacing them with object schemas.

  This command provides a workaround for circular or recursive references within OpenAPI definitions so they can render
  properly in ReadMe. It automatically identifies and replaces these references with simplified object schemas, ensuring
  compatibility for seamless display in the ReadMe API Reference. As a result, instead of displaying an empty form, as
  would occur with schemas containing such references, you will receive a flattened representation of the object,
  showing what the object can potentially contain, including references to itself. Complex circular references may
  require manual inspection and may not be fully resolved.

EXAMPLES
  This will resolve circular and recursive references in the OpenAPI definition at the given file or URL:

    $ rdme openapi refs [url-or-local-path-to-file]

  You can omit the file name and `rdme` will scan your working directory (and any subdirectories) for OpenAPI files.
  This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.

    $ rdme openapi refs

  If you wish to automate this command, you can pass in CLI arguments to bypass the prompts:

    $ rdme openapi refs petstore.json --out petstore.openapi.json
```

## `rdme openapi validate [SPEC]`

Validate your OpenAPI/Swagger definition.

```
USAGE
  $ rdme openapi validate [SPEC] [--github] [--workingDirectory <value>]

ARGUMENTS
  SPEC  A file/URL to your API definition

FLAGS
  --github                    Create a new GitHub Actions workflow for this command.
  --workingDirectory=<value>  Working directory (for usage with relative external references)

DESCRIPTION
  Validate your OpenAPI/Swagger definition.

  Perform a local validation of your API definition (no ReadMe account required!), which can be useful when constructing
  or editing your API definition.

EXAMPLES
  This will validate the API definition at the given URL or path:

    $ rdme openapi validate [url-or-local-path-to-file]

  You can omit the file name and `rdme` will scan your working directory (and any subdirectories) for OpenAPI/Swagger
  files. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.

    $ rdme openapi validate
```
