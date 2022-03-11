# 📖 rdme

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.com)

[![npm](https://img.shields.io/npm/v/rdme)](https://npm.im/rdme) [![Build](https://github.com/readmeio/rdme/workflows/CI/badge.svg)](https://github.com/readmeio/rdme)

`rdme` is [ReadMe](https://readme.com)'s official command-line interface (CLI) and [GitHub Action](#github-actions) wrapper. It allows you to sync [OpenAPI](https://spec.openapis.org/oas/v3.1.0.html) and [Swagger](https://swagger.io/specification/v2/) definitions with projects you create on [ReadMe](https://readme.com/). You can also access other parts of [ReadMe's RESTful API](https://docs.readme.com/reference/intro-to-the-readme-api), including syncing Markdown documentation with your project and managing project versions.

## Configuration

### Setup

> These setup instructions are for CLI usage only. For usage in GitHub Actions, see [GitHub Actions](#github-actions) below.

We recommend installing `rdme` in your project rather than doing a global installation so you don't run into unexpected behavior with mismatching versions. We also suggest using the `--save-dev` flag since `rdme` is typically used as part of a CI process and is unlikely to be running in your production application:

```sh
npm install rdme --save-dev
```

Once installed in your project, we recommend using `npx` (which is included if you have `npm` installed) to prefix all of your CLI commands. For example:

```sh
npx rdme validate [file]
```

To ensure you're getting the latest features and security updates, we recommend using a tool like [Dependabot](https://docs.github.com/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/about-dependabot-version-updates) to keep `rdme` (and your other dependencies) up-to-date.

### Authentication

For usage in CI environments (GitHub Actions, CircleCI, Travis CI, etc.) or if you're working with multiple ReadMe projects, we recommend providing your project API key via the `--key` option (instead of the configuration file authentication described below).

For local CLI usage with a single project, you can authenticate `rdme` to your ReadMe project. This will save your API key to a local configuration file (`~/.config/configstore/rdme-production.json`) so you will not have to provide the `--key` option to commands that require it.

```sh
rdme login
```

`rdme whoami` is also available to you to determine who you are logged in as, and to what project, as well as `rdme logout` for logging out of that account.

## Usage

If you wish to get more information about any command within `rdme`, you can execute `rdme help <command>` or `rdme <command> --help`. You an also execute `rdme help` to see a global list of commands that `rdme` offers.

### Common `rdme` Options

- `--key <string>`: The API key associated with your ReadMe project. Note that most of the commands below require API key authentication, even though the `--key` flag is omitted from the examples. See the [Authentication](#authentication) section above for more information.
- `--version <string>`: Your project version. See [our docs](https://docs.readme.com/docs/versions) for more information.

### GitHub Actions

> For a full GitHub Workflow file example and additional information on GitHub Actions usage, check out [our docs](https://docs.readme.com/docs/rdme#github-actions-usage).

For usage in [GitHub Actions](https://docs.github.com/actions), create [a new GitHub Workflow file](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions) in the `.github/workflows` directory of your repository and add the following [steps](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idsteps) to your workflow:

```yml
- uses: actions/checkout@v3
- uses: readmeio/rdme@XX
  with:
    rdme: [your command here]
```

The command syntax in GitHub Actions is functionally equivalent to the CLI. For example, take the following CLI command:

```sh
rdme openapi [path-to-file.json] --key=API_KEY --id=API_DEFINITION_ID
```

To execute this command via GitHub Actions, the step would look like this:

```yml
- uses: readmeio/rdme@XX
  with:
    rdme: openapi [path-to-file.json] --key=API_KEY --id=API_DEFINITION_ID
```

Note that the `@XX` in the above examples refers to the version of `rdme`. You can see examples featuring the latest version in [our docs](https://docs.readme.com/docs/rdme#example-syncing-an-openapi-definition). We recommend pointing to a fixed version, as opposed to pointing to something like the `main` branch, which could unexpectedly break your workflows. We also recommend [configuring Dependabot to keep your actions up-to-date](https://docs.github.com/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/keeping-your-actions-up-to-date-with-dependabot).

### OpenAPI / Swagger

ReadMe supports [OpenAPI 3.1](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md), [OpenAPI 3.0](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md), and [Swagger 2.x](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md).

The following examples use JSON files, but we support API Definitions that are written in either JSON or YAML.

> ℹ️ Note that the `rdme openapi` command supports both OpenAPI and Swagger API definitions. The `rdme swagger` command is an alias for `rdme openapi` and is deprecated.

#### Uploading a New API Definition to ReadMe

This will upload `path-to-openapi.json` to your project and return an ID and URL for you to later update your file, and view it in the client.

```sh
rdme openapi [path-to-file.json]
```

#### Editing (Re-Syncing) an Existing API Definition

This will edit (re-sync) an existing API definition (identified by `--id`) within your ReadMe project.

```sh
rdme openapi [path-to-file.json] --id={existing-id}
```

#### Uploading or Editing an API Definition in a Project Version

You can additional include a version flag, specifying the target version for your file's destination. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.

```sh
rdme openapi [path-to-file.json] --version={project-version}
```

#### Omitting the File Path

If you run `rdme` within a directory that contains your OpenAPI or Swagger definition, you can omit the file path. We will then look for a file with the following names, and upload that: `openapi.json`, `openapi.yaml`, `swagger.json`, and `swagger.yaml`.

```sh
rdme openapi
```

#### Override the Working Directory

By default, `rdme` bundles all [references](https://swagger.io/docs/specification/using-ref/) with paths based on the directory that `rdme` is being run in. You can override the working directory using the `--workingDirectory` option, which can be helpful for bundling certain external references (see [here](__tests__/__fixtures__/relative-ref-oas/petstore.json) for an example file).

```sh
rdme openapi petstore.json --workingDirectory=[path to directory]
```

#### Validating an API Definition

You can also perform a local validation of your API definition without uploading it to ReadMe, which can be useful when constructing or editing your API definition.

```sh
rdme validate [path-to-file.json]
```

### Docs

#### Syncing a Folder of Markdown Docs to ReadMe

The Markdown files will require YAML front matter with certain ReadMe documentation attributes. Check out [our docs](https://docs.readme.com/docs/rdme#markdown-file-setup) for more info on setting up your front matter.

Passing in a path to a directory will also sync any Markdown files that are located in subdirectories.

```sh
rdme docs path-to-markdown-files --version={project-version}
```

This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about dry run mode [in our docs](https://docs.readme.com/docs/rdme#dry-run-mode).

#### Edit a Single ReadMe Doc on Your Local Machine

```sh
rdme docs:edit <slug> --version={project-version}
```

### Versions

#### Get All Versions Associated With Your Project

```sh
rdme versions
```

If you wish to see the raw JSON output from our API in this response, supply the `--raw` flag.

#### Get All Information About a Particular Version

```sh
rdme versions --version={project-version}
```

If you wish to see the raw JSON output from our API in this response, supply the `--raw` flag.

#### Create a New Version

```sh
rdme versions:create <version> | --version={project-version}
```

##### Create a New Version

If you wish to automate the process of creating a new project version, and not have the CLI prompt you for input, you can do so by supplying the necessary flags to `versions:create`.

For example:

```sh
rdme versions:create <version> | --version={project-version} --fork={version-fork} --main={boolean} --beta={boolean} --isPublic={boolean}
```

See `rdme versions:create --help` for a full list of flags.

#### Update a Version

```sh
rdme versions:update --version={project-version}
```

Like `versions:create`, if you wish to automate this process and not be blocked by CLI input, you can supply the necessary flags to this command. See `rdme versions:update --help` for more information.

#### Delete a Version

You can remove a specific version from your project, as well as all of the attached specs

```sh
rdme versions:delete --version={project-version}
```

### Open Your ReadMe Project in Your Browser

If you are logged in, this will open the project in your browser:

```sh
rdme open
```

## Future

We are continually expanding and improving the offerings of this application as we expand our public API and are able. Some interactions may change over time, but we will do our best to retain backwards compatibility.
