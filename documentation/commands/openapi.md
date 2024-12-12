`rdme openapi`
==============

Manage your API definition (e.g., syncing, validation, analysis, conversion, etc.). Supports OpenAPI, Swagger, and Postman collections, in either JSON or YAML formats.

* [`rdme openapi convert [SPEC]`](#rdme-openapi-convert-spec)
* [`rdme openapi inspect [SPEC]`](#rdme-openapi-inspect-spec)
* [`rdme openapi reduce [SPEC]`](#rdme-openapi-reduce-spec)
* [`rdme openapi upload [SPEC]`](#rdme-openapi-upload-spec)
* [`rdme openapi validate [SPEC]`](#rdme-openapi-validate-spec)

## `rdme openapi convert [SPEC]`

Converts an API definition to OpenAPI and bundles any external references.

```
USAGE
  $ rdme openapi convert [SPEC] [--out <value>] [--title <value>] [--workingDirectory <value>]

ARGUMENTS
  SPEC  A path to your API definition — either a local file path or a URL. If your working directory and all
        subdirectories contain a single OpenAPI file, you can omit the path.

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
  SPEC  A path to your API definition — either a local file path or a URL. If your working directory and all
        subdirectories contain a single OpenAPI file, you can omit the path.

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
  SPEC  A path to your API definition — either a local file path or a URL. If your working directory and all
        subdirectories contain a single OpenAPI file, you can omit the path.

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

## `rdme openapi upload [SPEC]`

Upload (or re-upload) your API definition to ReadMe.

```
USAGE
  $ rdme openapi upload [SPEC] --key <value> [--slug <value>] [--useSpecVersion | --version <value>]

ARGUMENTS
  SPEC  A path to your API definition — either a local file path or a URL. If your working directory and all
        subdirectories contain a single OpenAPI file, you can omit the path.

FLAGS
  --key=<value>      (required) ReadMe project API key
  --slug=<value>     Override the slug (i.e., the unique identifier) for your API definition.
  --useSpecVersion   Use the OpenAPI `info.version` field for your ReadMe project version
  --version=<value>  [default: stable] ReadMe project version

DESCRIPTION
  Upload (or re-upload) your API definition to ReadMe.

  By default, the slug (i.e., the unique identifier for your API definition resource in ReadMe) will be inferred from
  the spec name and path. As long as you maintain these directory/file names and run `rdme` from the same location
  relative to your file, the inferred slug will be preserved and any updates you make to this file will be synced to the
  same resource in ReadMe.

  If the spec is a local file, the inferred slug takes the relative path and slugifies it (e.g., the slug for
  `docs/api/petstore.json` will be `docs-api-petstore.json`).

  If the spec is a URL, the inferred slug is the base file name from the URL (e.g., the slug for
  `https://example.com/docs/petstore.json` will be `petstore.json`).

EXAMPLES
  You can pass in a file name like so:

    $ rdme openapi upload --version=1.0.0 openapi.json

  You can also pass in a file in a subdirectory (we recommend always running the CLI from the root of your
  repository):

    $ rdme openapi upload --version=v1.0.0 example-directory/petstore.json

  You can also pass in a URL:

    $ rdme openapi upload --version=1.0.0 https://example.com/openapi.json

  If you specify your ReadMe project version in the `info.version` field in your OpenAPI definition, you can use that:

    $ rdme openapi upload --useSpecVersion https://example.com/openapi.json

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v10#authentication

  --slug=<value>  Override the slug (i.e., the unique identifier) for your API definition.

    Allows you to override the slug (i.e., the unique identifier for your API definition resource in ReadMe) that's
    inferred from the API definition's file/URL path.

    You do not need to include a file extension (i.e., either `custom-slug.json` or `custom-slug` will work). If you do,
    it must match the file extension of the file you're uploading.

  --useSpecVersion  Use the OpenAPI `info.version` field for your ReadMe project version

    If included, use the version specified in the `info.version` field in your OpenAPI definition for your ReadMe
    project version. This flag is mutually exclusive with `--version`.

  --version=<value>  ReadMe project version

    Defaults to `stable` (i.e., your main project version). This flag is mutually exclusive with `--useSpecVersion`.
```

## `rdme openapi validate [SPEC]`

Validate your OpenAPI/Swagger definition.

```
USAGE
  $ rdme openapi validate [SPEC] [--github] [--workingDirectory <value>]

ARGUMENTS
  SPEC  A path to your API definition — either a local file path or a URL. If your working directory and all
        subdirectories contain a single OpenAPI file, you can omit the path.

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
