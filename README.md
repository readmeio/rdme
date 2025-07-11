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

With `rdme`, you can manage your API definition (we support [OpenAPI](https://spec.openapis.org/oas/v3.1.0.html), [Swagger](https://swagger.io/specification/v2/), and [Postman](https://schema.postman.com/)) and sync it to your API reference docs on ReadMe.

Not using ReadMe for your docs? No worries. `rdme` has a variety of tools to help you identify issues with your API definition — no ReadMe account required.

> [!NOTE]
> If you're using [ReadMe Refactored](https://docs.readme.com/main/docs/migration), you'll want to use `rdme@10` or later. If you're **not** using ReadMe Refactored, you'll want to use `rdme@9`. More info can be found in our [migration guide](https://github.com/readmeio/rdme/blob/v10/documentation/migration-guide.md).

# Table of Contents

<!--
This section is autogenerated using `oclif` and is regenerated with every release.

If you wish to preview these changes locally, run the following:

```
npm run build && npm run build:docs
```
-->

<!-- prettier-ignore-start -->
<!-- toc -->
* [Table of Contents](#table-of-contents)
* [Quick Start](#quick-start)
* [CLI Configuration](#cli-configuration)
* [GitHub Actions Configuration](#github-actions-configuration)
* [Required in order for the GitHub Action to access your repo's contents](#required-in-order-for-the-github-action-to-access-your-repos-contents)
* [Runs the `rdme openapi validate petstore.json` command with the root directory being your repo](#runs-the-rdme-openapi-validate-petstorejson-command-with-the-root-directory-being-your-repo)
* [Command Topics](#command-topics)
<!-- tocstop -->
<!-- prettier-ignore-end -->

# Quick Start

Install the CLI ([see here for more setup options](#setup)):

```sh
npm install -g rdme
```

Validate an OpenAPI file in your working directory or any subdirectories ([see here for all command topics](#command-topics)):

```sh
rdme openapi validate
```

Every command has a help page, which you can access in [our docs](./documentation/commands) or via the CLI:

```sh
rdme openapi validate --help
```

To view the current version of `rdme` (helpful for troubleshooting and bug reports):

```sh
rdme --version
```

# CLI Configuration

## Setup

> [!NOTE]
> These setup instructions are for CLI usage only. For usage in GitHub Actions, see [GitHub Actions Configuration](#github-actions-configuration) below.

<img align="right" src="https://img.shields.io/node/v/rdme.svg?style=for-the-badge&label=" alt="Node Version">

To install the `rdme` CLI, you'll need to have [Node.js](https://nodejs.org) installed. Node.js comes bundled with [the `npm` CLI](https://github.com/npm/cli), which you'll need to install `rdme`. You can see our current Node.js version requirements in the green badge on the right.

### Installing `rdme` to Your Local Machine

The simplest way to use `rdme` is to install it globally:

```sh
npm install -g rdme
```

With a global installation, you'll be able to run `rdme` within any directory on your local machine. If you log in once, you can quickly access your project without having to remember your API key (see the [Authentication](#authentication) section below).

### Installing `rdme` to a Project

The recommended approach for shared projects is to install `rdme` in your project's dependencies, that way you don't run into unexpected behavior with mismatching versions of `rdme`. We also suggest using the `--save-dev` flag since `rdme` is typically used as part of a CI process and is unlikely to be running in your production application:

```sh
npm install rdme --save-dev
```

Once installed in your project, you can use the `npx` prefix (which is included if you have `npm` installed) to run your CLI commands locally. For example:

```sh
npx rdme openapi validate [file]
```

To ensure you're getting the latest features and security updates, we recommend using a tool like [Dependabot](https://docs.github.com/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates) to keep `rdme` (and your other dependencies) up-to-date.

## Authentication

For local CLI usage with a single project, you can authenticate `rdme` to your ReadMe project using `rdme login`. Once you follow the prompts and are successfully authenticated, your API key will be saved to a local configuration file (`~/.config/configstore/rdme-production.json`) and you won't have to provide the `--key` option to commands that require it.

> [!WARNING]
> For security reasons, we strongly recommend providing a project API key via the `--key` option in automations or CI environments (GitHub Actions, CircleCI, Travis CI, etc.). It's also recommended if you're working with multiple ReadMe projects to avoid accidentally overwriting existing data.

You can also pass in your API key via environmental variable. Here is the order of precedence when passing your API key into `rdme`:

1. The `--key` option. If that isn't present, we look for...
1. The `RDME_API_KEY` environmental variable. If that isn't present, we look for...
1. The `README_API_KEY` environmental variable. If that isn't present, we look for...
1. The API key value stored in your local configuration file (i.e., the one set via `rdme login`)

`rdme whoami` is also available to you to determine who is logged in, and to what project. You can clear your stored credentials with `rdme logout`.

### 1Password

As a secure alternative to the `rdme login` approach to using the CLI locally, [1Password](https://1password.com/) users can set up the [ReadMe shell plugin](https://developer.1password.com/docs/cli/shell-plugins/readme/). With this approach, you can store your ReadMe API key in 1Password and securely pass it in your `rdme` commands using biometrics. See below for a demo of this behavior:

https://user-images.githubusercontent.com/8854718/208739413-590aa265-072d-4800-bca1-27f281448017.mp4

To set this up, check out [1Password's documentation on the ReadMe shell plugin](https://developer.1password.com/docs/cli/shell-plugins/readme/).

## Proxy

`rdme` makes API requests to the ReadMe API, which is located at [dash.readme.com](https://dash.readme.com). If you need to configure a proxy for these requests, you can do so by setting the `HTTPS_PROXY` environmental variable.

```sh
export HTTPS_PROXY=https://proxy.example.com:5678
rdme login
```

# GitHub Actions Configuration

`rdme` has a thin wrapper that allows the CLI to be used as a proper action in a GitHub Actions workflow. For example, say you wanted to run `rdme openapi validate petstore.json` in a GitHub Actions environment. Here's what the corresponding steps would look like in a GitHub Actions workflow file:

```yml
# Required in order for the GitHub Action to access your repo's contents
- uses: actions/checkout@v4

# Runs the `rdme openapi validate petstore.json` command with the root directory being your repo
- uses: readmeio/rdme@v10
  with:
    rdme: openapi validate petstore.json
```

For more information on getting started with GitHub Actions, check out [our docs](https://docs.readme.com/main/docs/rdme#github-actions-usage).

<!-- (commenting all of this out until we add back this flag to all of the relevant commands)

For usage in [GitHub Actions](https://docs.github.com/actions), you can create a new GitHub Actions workflow file by installing the CLI on your local machine and running the the command you wish to run in GitHub Actions, along with the `--github` flag. For example:

```sh
rdme openapi validate --github
```

This will run through the `openapi validate` command, ask you a few quick questions, and then automatically create a fully functional GitHub Actions workflow file for you. 🪄

You can see examples featuring the latest version in [our docs](https://docs.readme.com/main/docs/rdme#github-actions-examples). We recommend [configuring Dependabot to keep your actions up-to-date](https://docs.github.com/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot). 

-->

<!--
This section is autogenerated using `oclif` and is regenerated with every release.

If you wish to preview these changes locally, run the following:

```
npm run build && npm run build:docs
```
-->

<!-- prettier-ignore-start -->
<!-- commands -->
# Command Topics

* [`rdme autocomplete`](documentation/commands/autocomplete.md) - Display autocomplete installation instructions.
* [`rdme changelog`](documentation/commands/changelog.md) - Upload Markdown files to the Changelog section of your ReadMe project.
* [`rdme custompages`](documentation/commands/custompages.md) - Upload Markdown or HTML files to the Custom Pages section of your ReadMe project.
* [`rdme docs`](documentation/commands/docs.md) - Upload Markdown files to the Guides section of your ReadMe project.
* [`rdme help`](documentation/commands/help.md) - Display help for rdme.
* [`rdme login`](documentation/commands/login.md) - Login to a ReadMe project.
* [`rdme logout`](documentation/commands/logout.md) - Logs the currently authenticated user out of ReadMe.
* [`rdme openapi`](documentation/commands/openapi.md) - Manage your API definition (e.g., syncing, validation, analysis, conversion, etc.). Supports OpenAPI, Swagger, and Postman collections, in either JSON or YAML formats.
* [`rdme plugins`](documentation/commands/plugins.md) - List installed plugins.
* [`rdme reference`](documentation/commands/reference.md) - Upload Markdown files to the Reference section of your ReadMe project.
* [`rdme whoami`](documentation/commands/whoami.md) - Displays the current user and project authenticated with ReadMe.

<!-- commandsstop -->
<!-- prettier-ignore-end -->

> [!IMPORTANT]
> You'll notice that several previous `rdme` commands are no longer present. That's because this version is for projects that use [ReadMe Refactored](https://docs.readme.com/main/docs/migration) and [bi-directional syncing](https://docs.readme.com/main/docs/bi-directional-sync) is the recommended approach for most workflows previously managed via `rdme`. See more in [our migration guide](./documentation/migration-guide.md).
