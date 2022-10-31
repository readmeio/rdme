[![rdme](https://user-images.githubusercontent.com/8854718/195465739-0f0f83d5-2e18-4e6c-96ae-944e3bb6880a.png)](https://readme.com)

<p align="center">
  <a href="https://readme.com">ReadMe</a>'s official command-line interface (CLI) and <a href="#github-actions-configuration">GitHub Action</a> 🌊
</p>

<p align="center">
  <a href="https://npm.im/rdme"><img src="https://img.shields.io/npm/v/rdme.svg?style=for-the-badge" alt="NPM Version"></a>
  <a href="https://npm.im/rdme"><img src="https://img.shields.io/node/v/rdme.svg?style=for-the-badge" alt="Node Version"></a>
  <a href="https://npm.im/rdme"><img src="https://img.shields.io/npm/l/rdme.svg?style=for-the-badge" alt="MIT License"></a>
  <a href="https://github.com/readmeio/rdme"><img src="https://img.shields.io/github/workflow/status/readmeio/rdme/CI.svg?style=for-the-badge" alt="Build status"></a>
</p>

With `rdme`, you can manage your API definition (we support [OpenAPI](https://spec.openapis.org/oas/v3.1.0.html) or [Swagger](https://swagger.io/specification/v2/)) and sync it to your API reference docs on ReadMe. You can also access other parts of [ReadMe's RESTful API](https://docs.readme.com/reference), including syncing Markdown documentation with your ReadMe project and managing project versions.

Not using ReadMe for your docs? No worries. `rdme` has a variety of tools to help you identify issues with your API definition — no ReadMe account required.

## Table of Contents

<!--
Pro tip: to autogenerate this TOC, run the following from your command line:

```
npx markdown-toc README.md --maxdepth 3 --bullets="-" -i
```

You'll need to remove the character escapes from where the emojis are used, see:
https://github.com/jonschlinkert/markdown-toc/issues/119
-->

<!-- toc -->

- [CLI Configuration](#cli-configuration)
  - [Setup](#setup)
  - [Authentication](#authentication)
- [GitHub Actions Configuration](#github-actions-configuration)
- [Usage](#usage)
  - [Common `rdme` Options](#common-rdme-options)
  - [OpenAPI / Swagger 📚](#openapi--swagger-)
  - [Docs (a.k.a. Guides) 📖](#docs-aka-guides-)
  - [Changelog 📣](#changelog-)
  - [Custom Pages 📄](#custom-pages-)
  - [Versions ⏳](#versions-)
  - [Categories 🪣](#categories-)
  - [Open Your ReadMe Project in Your Browser](#open-your-readme-project-in-your-browser)
- [Future](#future)

<!-- tocstop -->

## CLI Configuration

### Setup

> **Note**
> These setup instructions are for CLI usage only. For usage in GitHub Actions, see [GitHub Actions Configuration](#github-actions-configuration) below.

<img align="right" src="https://img.shields.io/node/v/rdme.svg?style=for-the-badge&label=" alt="Node Version">

To install the `rdme` CLI, you'll need to have [Node.js](https://nodejs.org) installed. Node.js comes bundled with [the `npm` CLI](https://github.com/npm/cli), which you'll need to install `rdme`. You can see our current Node.js version requirements in the green badge on the right.

#### Installing `rdme` to Your Local Machine

The simplest way to use `rdme` is to install it globally:

```sh
npm install -g rdme
```

With a global installation, you'll be able to run `rdme` within any directory on your local machine. If you log in once, you can quickly access your project without having to remember your API key (see the [Authentication](#authentication) section below).

#### Installing `rdme` to a Project

The recommended approach for shared projects is to install `rdme` in your project's dependencies, that way you don't run into unexpected behavior with mismatching versions of `rdme`. We also suggest using the `--save-dev` flag since `rdme` is typically used as part of a CI process and is unlikely to be running in your production application:

```sh
npm install rdme --save-dev
```

Once installed in your project, you can use the `npx` prefix (which is included if you have `npm` installed) to run your CLI commands locally. For example:

```sh
npx rdme openapi:validate [file]
```

To ensure you're getting the latest features and security updates, we recommend using a tool like [Dependabot](https://docs.github.com/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/about-dependabot-version-updates) to keep `rdme` (and your other dependencies) up-to-date.

### Authentication

For local CLI usage with a single project, you can authenticate `rdme` to your ReadMe project using `rdme login`. Once you follow the prompts and are successfully authenticated, your API key will be saved to a local configuration file (`~/.config/configstore/rdme-production.json`) and you won't have to provide the `--key` option to commands that require it.

For usage in CI environments (GitHub Actions, CircleCI, Travis CI, etc.) or if you're working with multiple ReadMe projects, we recommend providing a project API key via the `--key` option (instead of the configuration file authentication described above).

`rdme whoami` is also available to you to determine who is logged in, and to what project. You can clear your stored credentials with `rdme logout`.

## GitHub Actions Configuration

> **Note**
> For a full GitHub Workflow file example and additional information on GitHub Actions usage, check out [our docs](https://docs.readme.com/docs/rdme#github-actions-usage).

For usage in [GitHub Actions](https://docs.github.com/actions), you can create a new GitHub Actions workflow file by including the `--github` flag with the command you wish to run in GitHub Actions. For example:

```sh
rdme openapi --github
```

This will run through the `openapi` command, ask you a few quick questions, and then automatically create a fully functional GitHub Actions workflow file for you. 🪄

You can see examples featuring the latest version in [our docs](https://docs.readme.com/docs/rdme#github-actions-examples). We recommend [configuring Dependabot to keep your actions up-to-date](https://docs.github.com/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/keeping-your-actions-up-to-date-with-dependabot).

## Usage

If you wish to get more information about any command within `rdme`, you can execute `rdme help <command>` or `rdme <command> --help`. You an also execute `rdme help` to see a global list of commands that `rdme` offers.

### Common `rdme` Options

- `--key <string>`: The API key associated with your ReadMe project. Note that most of the commands below require API key authentication, even though the `--key` flag is omitted from the examples. See the [Authentication](#authentication) section above for more information.
- `--version <string>`: Your project version. See [our docs](https://docs.readme.com/docs/versions) for more information.

### OpenAPI / Swagger 📚

With `rdme`, you have access to a variety of tools to manage your OpenAPI or Swagger definition, most of which don't require an account on ReadMe. These tools include:

- [Reduction](#reducing-an-api-definition) 📉
- [Syncing](#syncing-an-api-definition-to-readme) 🦉
- [Validation](#validating-an-api-definition) ✅

`rdme` supports [OpenAPI 3.1](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md), [OpenAPI 3.0](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md), and [Swagger 2.x](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md).

The following examples use JSON files, but `rdme` supports API Definitions that are written in either JSON or YAML.

#### Syncing an API Definition to ReadMe

`rdme openapi` locates your API definition (if [you don't supply one](#omitting-the-file-path)), validates it, and then syncs it to your API reference on ReadMe.

> **Note**
> The `rdme openapi` command supports both OpenAPI and Swagger API definitions. The `rdme swagger` command is an alias for `rdme openapi` and is deprecated.

If you wish to programmatically access any of this script's results (such as the API defintion ID or the link to the corresponding docs in your dashboard), supply the `--raw` flag and the command will return a JSON output.

This command also has a dry run mode, which can be useful for initial setup and debugging. You can perform a dry run by supplying the `--dryRun` flag.

##### Omitting the File Path

If you run `rdme` within a directory that contains your OpenAPI or Swagger definition, you can omit the file path. `rdme` will then look for JSON or YAML files (including in sub-directories) that contain a top-level [`openapi`](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#fixed-fields) or [`swagger`](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#fixed-fields) property.

> **Note** `rdme` will not scan anything in the following:
>
> - Any `.git/` directories (if they exist)
> - Any files/directories specified in `.gitignore` files (including any `.gitignore` files in subdirectories, if they exist)

```sh
rdme openapi
```

##### Uploading a New API Definition to ReadMe

This will upload `path-to-openapi.json` to your project and return an ID and URL for you to later update your file, and view it in the client.

```sh
rdme openapi [path-to-file.json]
```

If you want to bypass the prompt to create or update an API definition, you can pass the `--create` flag:

```sh
rdme openapi [path-to-file.json] --version={project-version} --create
```

##### Editing (Re-Syncing) an Existing API Definition

This will edit (re-sync) an existing API definition (identified by `--id`) within your ReadMe project. **This is the recommended approach for usage in CI environments.**

```sh
rdme openapi [path-to-file.json] --id={existing-id}
```

##### Uploading or Editing an API Definition in a Project Version

You can additionally include a version flag, specifying the target version for your file's destination. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.

```sh
rdme openapi [path-to-file.json] --version={project-version}
```

If you wish to use the version specified [in the `info.version` field of your API definition](https://spec.openapis.org/oas/v3.1.0#fixed-fields-0), you can pass the `--useSpecVersion` option. For example, say [the `info` object](https://spec.openapis.org/oas/v3.1.0#info-object) of your API definition looks like this:

```json
{
  "version": "1.2.3",
  "title": "Single Path",
  "description": "This is a slimmed down single path version of the Petstore definition."
}
```

You can pass in the `--useSpecVersion` option, which would be equivalent to passing in `--version=1.2.3`:

```sh
rdme openapi [path-to-file.json] --useSpecVersion
```

You can add `--update` to the command so if there's only one API definition for the given project version to update, it will select it without any prompts:

```sh
rdme openapi [path-to-file.json] --version={project-version} --update
```

##### Override the Working Directory

By default, `rdme` bundles all [references](https://swagger.io/docs/specification/using-ref/) with paths based on the directory that `rdme` is being run in. You can override the working directory using the `--workingDirectory` option, which can be helpful for bundling certain external references (see [here](__tests__/__fixtures__/relative-ref-oas/petstore.json) for an example file).

```sh
rdme openapi petstore.json --workingDirectory=[path to directory]
```

#### Validating an API Definition

You can also perform a local validation of your API definition (no ReadMe account required!), which can be useful when constructing or editing your API definition.

```sh
rdme openapi:validate [path-to-file.json]
```

Similar to the `openapi` command, you can also [omit the file path](#omitting-the-file-path).

#### Reducing an API Definition

We also offer a tool that allows you to reduce a large API definition down to a specific set of tags or paths (again, no ReadMe account required!). This can be useful if you're debugging a problematic schema somewhere, or if you have a file that is too big to maintain.

```sh
rdme openapi:reduce [path-to-file.json]
```

The command will ask you a couple questions about how you wish to reduce the file and then do so. And as with the `openapi` command, you can also [omit the file path](#omitting-the-file-path).

### Docs (a.k.a. Guides) 📖

The Markdown files will require YAML front matter with certain ReadMe documentation attributes. Check out [our docs](https://docs.readme.com/docs/rdme#markdown-file-setup) for more info on setting up your front matter.

Passing in a path to a directory will also sync any Markdown files that are located in subdirectories. The path input can also be individual Markdown files.

```sh
rdme docs [path] --version={project-version}
```

This command also has an alias called `guides`:

```
rdme guides [path] --version={project-version}
```

This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about dry run mode [in our docs](https://docs.readme.com/docs/rdme#dry-run-mode).

#### Prune

If you wish to delete documents from ReadMe that are no longer present in your local directory:

```sh
rdme docs:prune [path-to-directory-of-markdown]
```

Run with `--confirm` to bypass the confirmation prompt (useful for CI environments).

This command also has an alias called `guides:prune`:

```sh
rdme guides:prune path-to-directory-of-markdown
```

### Changelog 📣

The Markdown files will require YAML front matter with certain ReadMe documentation attributes. Check out [our docs](https://docs.readme.com/docs/rdme#markdown-file-setup) for more info on setting up your front matter.

Passing in a path to a directory will also sync any Markdown files that are located in subdirectories. The path input can also be individual Markdown files.

```sh
rdme changelogs [path]
```

This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about dry run mode [in our docs](https://docs.readme.com/docs/rdme#dry-run-mode).

### Custom Pages 📄

Custom Pages has support for both Markdown and HTML files. These files will require YAML front matter with certain ReadMe documentation attributes. Check out [our docs](https://docs.readme.com/docs/rdme#markdown-file-setup) for more info on setting up your front matter.

Passing in a path to a directory will also sync any HTML/Markdown files that are located in subdirectories. The path input can also be individual HTML/Markdown files.

```sh
rdme custompages [path]
```

This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about dry run mode [in our docs](https://docs.readme.com/docs/rdme#dry-run-mode).

### Versions ⏳

#### Get All Versions Associated With Your Project

```sh
rdme versions
```

#### Get All Information About a Particular Version

```sh
rdme versions --version={project-version}
```

If you wish to see the raw JSON output from our API in this response, supply the `--raw` flag.

#### Create a New Version

```sh
rdme versions:create <version>
```

If you wish to automate the process of creating a new project version, and not have the CLI prompt you for input, you can do so by supplying the necessary flags to `versions:create`.

For example:

```sh
rdme versions:create <version> --fork={version-fork} --main={true|false} --beta={true|false} --isPublic={true|false}
```

See `rdme versions:create --help` for a full list of flags.

#### Update a Version

```sh
rdme versions:update <version>
```

Like `versions:create`, if you wish to automate this process and not be blocked by CLI input, you can supply the necessary flags to this command. See `rdme versions:update --help` for more information.

#### Delete a Version

You can remove a specific version from your project, as well as all of the attached specs

```sh
rdme versions:delete <version>
```

### Categories 🪣

#### Get All Categories Associated to Your Project Version

```sh
rdme categories --version={project-version}
```

#### Create a New Category for your Project Version

```sh
rdme categories:create <title> --categoryType={category-type} --version={project-version}
```

`categoryType` is required and must be set to either `guide` or `reference`

If you want to prevent the creation of a duplicate category with a matching `title` and `categoryType`, supply the `--preventDuplicates` flag.

### Open Your ReadMe Project in Your Browser

If you are logged in, this will open the project in your browser:

```sh
rdme open
```

## Future

We are continually expanding and improving the offerings of this application as we expand our public API and are able. Some interactions may change over time, but we will do our best to retain backwards compatibility.
