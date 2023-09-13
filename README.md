[![rdme](https://user-images.githubusercontent.com/8854718/195465739-0f0f83d5-2e18-4e6c-96ae-944e3bb6880a.png)](https://readme.com)

<p align="center">
  <a href="https://readme.com">ReadMe</a>'s official command-line interface (CLI) and <a href="#github-actions-configuration">GitHub Action</a> 🌊
</p>

<p align="center">
  <a href="https://npm.im/rdme"><img src="https://img.shields.io/npm/v/rdme?style=for-the-badge" alt="NPM Version"></a>
  <a href="https://npm.im/rdme"><img src="https://img.shields.io/node/v/rdme?style=for-the-badge" alt="Node Version"></a>
  <a href="https://npm.im/rdme"><img src="https://img.shields.io/npm/l/rdme?style=for-the-badge" alt="MIT License"></a>
  <a href="https://github.com/readmeio/rdme"><img src="https://img.shields.io/github/actions/workflow/status/readmeio/rdme/ci.yml?branch=main&style=for-the-badge" alt="Build status"></a>
</p>

<p align="center">
  <a href="https://readme.com"><img src="https://raw.githubusercontent.com/readmeio/.github/main/oss-badge.svg" /></a>
</p>

<!--alex ignore postman-postwoman-->

With `rdme`, you can manage your API definition (we support [OpenAPI](https://spec.openapis.org/oas/v3.1.0.html), [Swagger](https://swagger.io/specification/v2/), and [Postman](https://schema.postman.com/)) and sync it to your API reference docs on ReadMe. You can also access other parts of [ReadMe's RESTful API](https://docs.readme.com/reference), including syncing Markdown documentation with your ReadMe project and managing project versions.

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
  - [Proxy](#proxy)
- [GitHub Actions Configuration](#github-actions-configuration)
- [Usage](#usage)
  - [Common `rdme` Options](#common-rdme-options)
  - [API Definitions 📚](#api-definitions-)
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

> [!NOTE]
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

To ensure you're getting the latest features and security updates, we recommend using a tool like [Dependabot](https://docs.github.com/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates) to keep `rdme` (and your other dependencies) up-to-date.

### Authentication

For local CLI usage with a single project, you can authenticate `rdme` to your ReadMe project using `rdme login`. Once you follow the prompts and are successfully authenticated, your API key will be saved to a local configuration file (`~/.config/configstore/rdme-production.json`) and you won't have to provide the `--key` option to commands that require it.

> [!WARNING]
> For security reasons, we strongly recommend providing a project API key via the `--key` option in automations or CI environments (GitHub Actions, CircleCI, Travis CI, etc.). It's also recommended if you're working with multiple ReadMe projects to avoid accidentally overwriting existing data.

You can also pass in your API key via the `RDME_API_KEY` environmental variable. Here is the order of precedence when passing your API key into `rdme`:

1. The `--key` option. If that isn't present, we look for...
1. The `RDME_API_KEY` environmental variable. If that isn't present, we look for...
1. The API key value stored in your local configuration file (i.e., the one set via `rdme login`)

`rdme whoami` is also available to you to determine who is logged in, and to what project. You can clear your stored credentials with `rdme logout`.

#### 1Password

As a secure alternative to the `rdme login` approach to using the CLI locally, [1Password](https://1password.com/) users can set up the [ReadMe shell plugin](https://developer.1password.com/docs/cli/shell-plugins/readme/). With this approach, you can store your ReadMe API key in 1Password and securely pass it in your `rdme` commands using biometrics. See below for a demo of this behavior:

https://user-images.githubusercontent.com/8854718/208739413-590aa265-072d-4800-bca1-27f281448017.mp4

To set this up, check out [1Password's documentation on the ReadMe shell plugin](https://developer.1password.com/docs/cli/shell-plugins/readme/).

### Proxy

`rdme` makes API requests to the ReadMe API, which is located at [dash.readme.com](https://dash.readme.com). If you need to configure a proxy for these requests, you can do so by setting the `HTTPS_PROXY` environmental variable.

```sh
export HTTPS_PROXY=https://proxy.example.com:5678
rdme openapi
```

## GitHub Actions Configuration

> [!NOTE]
> For a full GitHub Workflow file example and additional information on GitHub Actions usage, check out [our docs](https://docs.readme.com/docs/rdme#github-actions-usage).

For usage in [GitHub Actions](https://docs.github.com/actions), you can create a new GitHub Actions workflow file by including the `--github` flag with the command you wish to run in GitHub Actions. For example:

```sh
rdme openapi --github
```

This will run through the `openapi` command, ask you a few quick questions, and then automatically create a fully functional GitHub Actions workflow file for you. 🪄

You can see examples featuring the latest version in [our docs](https://docs.readme.com/docs/rdme#github-actions-examples). We recommend [configuring Dependabot to keep your actions up-to-date](https://docs.github.com/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot).

## Usage

If you wish to get more information about any command within `rdme`, you can execute `rdme help <command>` or `rdme <command> --help`. You an also execute `rdme help` to see a global list of commands that `rdme` offers.

### Common `rdme` Options

- `--key <string>`: The API key associated with your ReadMe project. Note that most of the commands below require API key authentication, even though the `--key` flag is omitted from the examples. See the [Authentication](#authentication) section above for more information.
- `--version <string>`: Your project version. See [our docs](https://docs.readme.com/docs/versions) for more information.

### API Definitions 📚

With `rdme`, you have access to a variety of tools to manage your API definition, most of which don't require an account on ReadMe. These tools include:

- [Syncing](#syncing-an-api-definition-to-readme) 🦉
- [Validation](#validating-an-api-definition) ✅
- [Reduction](#reducing-an-api-definition) 📉
- [Inspection](#inspecting-an-api-definition) 🔍
- [Conversion](#converting-an-api-definition) ⏩

`rdme` supports [OpenAPI 3.1](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md), [OpenAPI 3.0](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md), and [Swagger 2.x](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md).

<!--alex ignore postman-postwoman-->

You can also pass in [Postman Collections](https://www.postman.com/collection/). Postman Collections are converted to OpenAPI using [`postman-to-openapi`](https://github.com/joolfe/postman-to-openapi) prior to any syncing/validation/etc.

The following examples use JSON files, but `rdme` supports API Definitions that are written in either JSON or YAML.

#### Syncing an API Definition to ReadMe

`rdme openapi` locates your API definition (if [you don't supply one](#omitting-the-file-path)), validates it, and then syncs it to your API reference on ReadMe.

> [!NOTE]
> The `rdme openapi` command supports both OpenAPI and Swagger API definitions. The `rdme swagger` command is an alias for `rdme openapi` and is deprecated.

If you wish to programmatically access any of this script's results (such as the API definition ID or the link to the corresponding docs in your dashboard), supply the `--raw` flag and the command will return a JSON output.

This command also has a dry run mode, which can be useful for initial setup and debugging. You can perform a dry run by supplying the `--dryRun` flag.

##### Omitting the File Path

If you run `rdme` within a directory that contains your OpenAPI or Swagger definition, you can omit the file path. `rdme` will then look for JSON or YAML files (including in sub-directories) that contain a top-level [`openapi`](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#fixed-fields) or [`swagger`](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#fixed-fields) property.

> [!NOTE] `rdme` will not scan anything in the following:
>
> - Any `.git/` directories (if they exist)
> - Any files/directories specified in `.gitignore` files (including any `.gitignore` files in subdirectories, if they exist)

```sh
rdme openapi
```

##### Uploading a New API Definition to ReadMe

This will upload the API definition at the given URL or path to your project and return an ID and URL for you to later update your file, and view it in the client.

```sh
rdme openapi [url-or-local-path-to-file]
```

If you want to bypass the prompt to create or update an API definition, you can pass the `--create` flag:

```sh
rdme openapi [url-or-local-path-to-file] --version={project-version} --create
```

##### Editing (Re-Syncing) an Existing API Definition

This will edit (re-sync) an existing API definition (identified by `--id`) within your ReadMe project. **This is the recommended approach for usage in CI environments.**

```sh
rdme openapi [url-or-local-path-to-file] --id={existing-id}
```

##### Uploading or Editing an API Definition in a Project Version

You can additionally include a version flag, specifying the target version for your file's destination. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.

```sh
rdme openapi [url-or-local-path-to-file] --version={project-version}
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
rdme openapi [url-or-local-path-to-file] --useSpecVersion
```

You can add `--update` to the command so if there's only one API definition for the given project version to update, it will select it without any prompts:

```sh
rdme openapi [url-or-local-path-to-file] --version={project-version} --update
```

##### Override the Working Directory

By default, `rdme` bundles all [references](https://swagger.io/docs/specification/using-ref/) with paths based on the directory that `rdme` is being run in. You can override the working directory using the `--workingDirectory` option, which can be helpful for bundling certain external references (see [here](__tests__/__fixtures__/relative-ref-oas/petstore.json) for an example file).

```sh
rdme openapi petstore.json --workingDirectory=[path to directory]
```

#### Validating an API Definition

You can also perform a local validation of your API definition (no ReadMe account required!), which can be useful when constructing or editing your API definition.

```sh
rdme openapi:validate [url-or-local-path-to-file]
```

Similar to the `openapi` command, you can also [omit the file path](#omitting-the-file-path).

#### Reducing an API Definition

We also offer a tool that allows you to reduce a large API definition down to a specific set of tags or paths (again, no ReadMe account required!). This can be useful if you're debugging a problematic schema somewhere, or if you have a file that is too big to maintain.

```sh
rdme openapi:reduce [url-or-local-path-to-file]
```

The command will ask you a couple questions about how you wish to reduce the file and then do so. If you wish to automate this command, you can pass in CLI arguments to bypass the prompts. Here's an example use case:

- The input API definition is called `petstore.json`
- The file is reduced to only the `/pet/{id}` path and the `GET` and `PUT` methods
- The output file is called `petstore.reduced.json`

Here's what the resulting command looks like:

```
rdme openapi:reduce petstore.json --path /pet/{id} --method get --method put --out petstore.reduced.json
```

As with the `openapi` command, you can also [omit the file path](#omitting-the-file-path).

#### Inspecting an API Definition

This tool can also perform a comprehensive analysis (again, no ReadMe account required!) of your API definition to determine how it's utilizing aspects of [the OpenAPI Specification](https://spec.openapis.org/oas/v3.1.0.html) (such as circular references, polymorphism, etc.) and any [ReadMe-specific extensions](https://docs.readme.com/main/docs/openapi-extensions) you might be using.

```sh
rdme openapi:inspect [url-or-local-path-to-file]
```

This command contains a `--feature` flag so you can filter for one or several specific features. If you pass in one or more `--feature` flags, the command returns a `0` exit code if your definition contains all of the given features and a `1` exit code if your definition lacks any of the given features.

```sh
rdme openapi:inspect [url-or-local-path-to-file] --feature circularRefs --feature polymorphism
```

As with the `openapi` command, you can also [omit the file path](#omitting-the-file-path).

#### Converting an API definition

<!--alex ignore postman-postwoman-->

You can also convert any Swagger or Postman Collection to an OpenAPI 3.0 definition.

```sh
rdme openapi:convert [url-or-local-path-to-file]
```

Similar to the `openapi` command, you can also [omit the file path](#omitting-the-file-path).

> [!NOTE]
> All of our OpenAPI commands already do this conversion automatically, but in case you need to utilize this exclusive functionality outside of the context of those, you can.

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

##### Get All Information About a Particular Version

```sh
rdme versions --version={project-version}
```

#### Create a New Version

```sh
rdme versions:create <version>
```

If you wish to automate the process of creating a new project version, and not have the CLI prompt you for input, you can do so by supplying the necessary flags to `versions:create`. The best way to ensure that you have supplied all the necessary flags is by running the command locally and verifying that the CLI does not prompt you.

For example, the following command contains all the flags to bypass the CLI prompts:

```sh
rdme versions:create <version> --fork={version-fork} --main={true|false} --beta={true|false} --deprecated={true|false} --isPublic={true|false}
```

See `rdme versions:create --help` for a full list of flags.

#### Update a Version

```sh
rdme versions:update <version>
```

Like `versions:create`, if you wish to automate this process and not be blocked by CLI input, you can supply the necessary flags to this command. See `rdme versions:update --help` for a full list of flags.

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
