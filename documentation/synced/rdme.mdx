---
title: Syncing Docs via CLI / GitHub
content:
  excerpt: >-
    Update your docs automatically with `rdme`, ReadMe's official CLI and GitHub
    Action!
---

{/* prettier-ignore */}
{/* <!--

Hello curious raw Markdown reader! 👋
This Markdown page is syncing to ReadMe via the `rdme` GitHub Action 🦉
Peep the resulting page in our docs: https://docs.readme.com/docs/rdme

We also do some fancy little find-and-replace action to swap out every instance
of `RDME_VERSION` below with the latest version of rdme.
Check out `.github/workflows/docs.yml` for more info on this!

--> \*/}

[![rdme](https://user-images.githubusercontent.com/8854718/195465739-0f0f83d5-2e18-4e6c-96ae-944e3bb6880a.png)](https://readme.com)

<p align="center">
  <a href="https://readme.com">ReadMe</a>'s official command-line interface (CLI) and{' '}
  <a href="#github-actions-usage">GitHub Action</a> 🌊
</p>

<p align="center">
  <a href="https://npm.im/rdme">
    <img src="https://img.shields.io/npm/v/rdme?style=for-the-badge" alt="NPM Version" />
  </a>
  <a href="https://npm.im/rdme">
    <img src="https://img.shields.io/node/v/rdme?style=for-the-badge" alt="Node Version" />
  </a>
  <a href="https://npm.im/rdme">
    <img src="https://img.shields.io/npm/l/rdme?style=for-the-badge" alt="MIT License" />
  </a>
  <a href="https://github.com/readmeio/rdme">
    <img
      src="https://img.shields.io/github/actions/workflow/status/readmeio/rdme/ci.yml?branch=main&style=for-the-badge"
      alt="Build status"
    />
  </a>
</p>

<p align="center">
  <a href="https://readme.com">
    <img src="https://raw.githubusercontent.com/readmeio/.github/main/oss-badge.svg" />
  </a>
</p>

Thanks to ReadMe's support [for bi-directional syncing](https://docs.readme.com/main/docs/bi-directional-sync), technical and nontechnical content writers alike can collaborate on docs using a workflow of their choice. But if you're anything like us, your documentation process may be a part of a broader CI/CD process that necessitates a more complex workflow. For example, you may want to automatically update your Guides or API reference on ReadMe every time you ship new code.

That's where `rdme` — ReadMe's official command-line interface (CLI) and GitHub Action — comes in! With `rdme`, you can create workflows for a variety of use cases, including:

- Syncing [OpenAPI/Swagger](https://docs.readme.com/docs/openapi) definitions (with support for bundling external references) 📦
- Pre-upload validation (including OpenAPI 3.1) ✅
- Syncing directories of Markdown files 📖

## General Setup and Usage

To see detailed CLI setup instructions and all available commands, check out [the `rdme` GitHub repository](https://github.com/readmeio/rdme#readme).

### Markdown File Setup

> 🚧 ReadMe Refactored Guidance
>
> This guidance is only applicable for projects that have been migrated to [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored). The Refactored project architecture requires `rdme@10`, while the legacy project architecture requires `rdme@9`.
>
> For more information, check out our [migration guide](https://github.com/readmeio/rdme/blob/v10/documentation/migration-guide.md)

With `rdme`, you can sync Markdown files to any of the following sections:

- Guides (using the `docs upload` command)
- API Reference (using the `reference upload` command)
- Changelog (using the `changelog upload` command)
- Custom Pages (using the `custompages upload` command)

These Markdown files require [YAML frontmatter](https://jekyllrb.com/docs/front-matter/) attributes at the top of each page. See below for an example in the Guides section (using the page you're currently reading!):

```markdown
---
title: Syncing Docs via CLI / GitHub
content:
  excerpt: Update your docs automatically with `rdme`, ReadMe's official CLI and GitHub Action!
category:
  uri: documentation
---

With ReadMe's support for...
```

In this section, we'll go over how to set these Markdown files up so you can sync them to ReadMe.

> 📘 Guides, Reference, Changelog, Custom Pages... you name it!
>
> The guidance on Markdown file setup is nearly identical for all of the above sections. There are a few small differences:
>
> - Guides, API Reference, and Custom Pages are tied to project branches (f.k.a. versions) and therefore have a `--branch` flag (when omitted, your default version is used). Changelog entries are not versioned and therefore the command does not accept the `--branch` flag.
> - There are slight variations in the YAML frontmatter attributes for each respective section of your documentation. For example, Changelog entries have a `type` attribute which you can set to `added`. See [Specifying Other Attributes](#specifying-other-attributes) for more information.
> - In addition to Markdown, Custom Pages also supports HTML files. If you pass an HTML file into the `custompages` commands, the page will have the `content.type` attribute set to `html` and it will conversely be set to `markdown` for Markdown files. You can override this in the YAML frontmatter.

#### Required Attributes

See below for a table detailing the required YAML frontmatter attributes:

| Attribute      | Required for Changelog? | Required for Custom Pages? | Required for Guides? | Required for API Reference? |
| :------------- | :---------------------- | :------------------------- | :------------------- | :-------------------------- |
| `title`        | Yes                     | Yes                        | Yes                  | Yes                         |
| `category.uri` | No                      | No                         | Yes                  | Yes                         |

To determine what your `uri` value should be, you can use [the `Get all categories` endpoint](https://docs.readme.com/reference/getcategories-1) and grab the `uri` value from the response.

> 📘
>
> Any Markdown/HTML files that lack YAML frontmatter attributes will be skipped.

#### Page Hierarchy Attributes

`rdme` is directory-agnostic by design, meaning that you can organize your Markdown files in your local directory however you'd like and it will not impact how ReadMe displays them in the sidebar. This also means that any page hierarchy attributes should be specified in the frontmatter of each Markdown file.

> 📘
>
> If you'd prefer a workflow where the directory structure of your Markdown files matches your ReadMe documentation, check out [bi-directional sync](https://docs.readme.com/main/docs/bi-directional-sync).

Here are a few attributes that describe page hierarchy (applicable only to the Guides and API reference sections, since these are the only sections with a proper sidebar):

- category (specified using the `category.uri` attribute)
- page order within a category (specified using the `position` attribute)
- parent/child page hierarchy (specified in the child page using the `parent.uri` attribute)

For example, let's say I have a parent and child page (called `parent.md` and `child.md`, respectively), both located within the "Documentation" category of my Guides. Here's what the frontmatter for `child.md` would look like:

```markdown
---
title: Example child page
category:
  uri: documentation
parent:
  uri: parent
---
```

#### Specifying Page Slugs

By default, we automatically derive the page's slug via the file name (e.g., a page that is synced to your Guides section with the file name `rdme.md` would become `https://docs.example.com/docs/rdme` in your ReadMe project). Note that our API uses [`slugify`](https://www.npmjs.com/package/slugify) to automatically handle certain characters (e.g., spaces), which may lead to unexpected syncing behavior if your file names don't match your page slugs. If you prefer to keep your page slugs different from your file names, you can manually set the `slug` value in the YAML frontmatter:

```markdown
---
title: Syncing Docs via CLI / GitHub
content:
  excerpt: Update your docs automatically with `rdme`, ReadMe's official CLI and GitHub Action!
category:
  uri: documentation
slug: an-alternative-page-slug-example
---
```

#### Specifying Other Attributes

You can also specify several other page attributes in your YAML frontmatter, such as `privacy` (an object that sets a `view` attribute to `public` or `anyone_with_link` to denote whether your page is published or unpublished). Any attributes you omit will remain unchanged on subsequent `rdme` updates. To view the full list of attributes, check out the `POST` endpoints for respective section of your documentation that you're syncing:

- [`Create doc`](https://docs.readme.com/main/reference/createguide/)
- [`Create reference`](https://docs.readme.com/reference/createreference)
- [`Create changelog`](https://docs.readme.com/reference/createchangelog-1)
- [`Create custom page`](https://docs.readme.com/reference/createcustompage-1)

#### Dry Run Mode

If you're setting up new pages or if you're generally unsure if you've set up your page attributes correctly, each command has a dry run mode. This will allow you to validate the frontmatter and preview the changes without actually creating/updating any docs in ReadMe, which can be extremely useful for initial setup (oh, and we have [comprehensive debugging options](#troubleshooting) available as well!). To enable dry run mode, use the `--dry-run` flag:

```sh
rdme docs upload [path] --dry-run
rdme reference upload [path] --dry-run
rdme changelog upload [path] --dry-run
rdme custompages upload [path] --dry-run
```

The command output will validate the frontmatter attributes and indicate whether each page is being created or updated alongside all processed page attributes.

## GitHub Actions Usage

With [GitHub Actions](https://docs.github.com/actions), you can automatically execute workflows when certain events take place in your GitHub repository (e.g., code is pushed to the default branch, a new pull request is opened, etc.).

While there are [dozens of event options available](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows), you'll typically want to sync your OpenAPI definition and Markdown docs to ReadMe when one of the following events takes place:

- [Code is pushed to the default branch](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#push) 🌴
- [A build is deployed](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#deployment) 🚀
- [A release is created](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#release) 🆕

> 📘 Keeping `rdme` up-to-date
>
> Note that `@RDME_VERSION` (used in the examples on this page) is the latest version of `rdme`. We recommend [configuring Dependabot to keep your actions up-to-date](https://docs.github.com/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot).

### Manually Configuring a GitHub Actions Workflow

Follow these steps to manually configure a GitHub Actions Workflow. This will require some familiarity with the [workflow syntax](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)

1. Create a new [GitHub Actions workflow file](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions) in the `.github/workflows` directory of your repository (or use an existing workflow file)

1. Configure the [`on`](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#on) property, which determines what triggers the execution of the workflow.

1. Add the following two [steps](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idsteps) to your workflow:

```yml
# Required in order for the GitHub Action to access your repo's contents
- uses: actions/checkout@v4

# Runs the `rdme` command on your repo's contents
- uses: readmeio/rdme@RDME_VERSION
  with:
    rdme: [your command here]
```

The command syntax in GitHub Actions is functionally equivalent to the CLI. For example, take the following CLI command:

```sh
rdme openapi validate [url-or-local-path-to-file]
```

To execute this command via GitHub Actions, the step would look like this:

```yml
- uses: readmeio/rdme@RDME_VERSION
  with:
    rdme: openapi validate [url-or-local-path-to-file]
```

The following section has links to full GitHub Actions workflow file examples.

> 👍 Did you know?
>
> Not to get too meta on you, but... the page that you're currently reading is actually being synced from the `rdme` GitHub repository via the `rdme` GitHub Action 🤯
>
> Here are the relevant files on GitHub:
>
> - [The Markdown source file for the page you're reading](https://github.com/readmeio/rdme/blob/main/documentation/rdme.md) 📜
> - [The GitHub Actions workflow file that syncs the Markdown to docs.readme.com](https://github.com/readmeio/rdme/blob/main/.github/workflows/docs.yml) 🔄
> - And finally... [the workflow run results](https://github.com/readmeio/rdme/actions/workflows/docs.yml) ✅

### GitHub Actions Examples

> 🚧 ReadMe Refactored Guidance
>
> This guidance is only applicable for projects that have been migrated to [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored). The Refactored project architecture requires `rdme@10`, while the legacy project architecture requires `rdme@9`.
>
> For more information, check out our [migration guide](https://github.com/readmeio/rdme/blob/v10/documentation/migration-guide.md)

Want to start syncing? We have several example workflow files available:

- [Syncing an OpenAPI definition](https://docs.readme.com/docs/github-actions-openapi-example)
- [Syncing a directory of Markdown files](https://docs.readme.com/docs/github-actions-docs-example)

### Securely Using Your API Key

> 🚧 Secretly store your ReadMe API Key!
>
> GitHub Actions has [secrets](https://docs.github.com/actions/security-guides/encrypted-secrets) to securely store sensitive information so it isn't publicly visible. We **strongly** recommend using these for storing your ReadMe API Key and any other secret keys—whether your repository is public or private. You can read more about setting these up [in their documentation](https://docs.github.com/actions/security-guides/encrypted-secrets).

To use sensitive information (like your ReadMe API key) in your `rdme` GitHub Action, first [create a new repository secret](https://docs.github.com/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). Let's say you create a new secret key called `README_API_KEY`. The usage in the `rdme` step will look something like this:

```yml
- uses: readmeio/rdme@RDME_VERSION
  with:
    rdme: openapi upload [url-or-local-path-to-file] --key=${{ secrets.README_API_KEY }}
```

## Usage in Other CI Environments

Since `rdme` is a command-line tool at its core, you can use `rdme` to sync your documentation from virtually any CI/CD environment that runs shell commands—[Bitbucket Pipelines](https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/), [GitLab CI/CD](https://docs.gitlab.com/ee/ci/), you name it! You can do this by invoking `rdme` with `npx rdme@RDME_VERSION` in a Node.js environment. See below for several examples.

{/* prettier-ignore */}
{/* <!--
The two code blocks below must be joined (i.e. no newline in between) in order to render as tabbed code blocks in ReadMe.

Unfortunately we need to ignore both code blocks entirely so Prettier doesn't separate them.
--> \*/}

{/* prettier-ignore-start */}
```yml Bitbucket Pipelines (bitbucket-pipelines.yml)
# Official framework image. Look for the different tagged releases at:
# https://hub.docker.com/r/library/node/tags/
image: node:NODE_VERSION
pipelines:
  default:
    - step:
        script:
          - npx rdme@RDME_VERSION openapi upload [url-or-local-path-to-file] --key=$README_API_KEY
```
```yml CircleCI (.circleci/config.yml)
version: 2.1
jobs:
  sync-via-rdme:
    docker:
      # Official framework image. Look for the different tagged releases at:
      # https://hub.docker.com/r/library/node/tags/
      - image: node:NODE_VERSION
    steps:
      - run:
          command: npx rdme@RDME_VERSION openapi upload [url-or-local-path-to-file] --key=$README_API_KEY
```
```yml GitLab CI (rdme-sync.gitlab-ci.yml)
# Official framework image. Look for the different tagged releases at:
# https://hub.docker.com/r/library/node/tags/
image: node:NODE_VERSION

sync-via-rdme:
  script:
    - npx rdme@RDME_VERSION openapi upload [url-or-local-path-to-file] --key=$README_API_KEY
```
```yml Travis CI (.travis.yml)
# https://docs.travis-ci.com/user/languages/javascript-with-nodejs/#specifying-nodejs-versions
language: node_js
node_js:
  - NODE_VERSION

script: npx rdme@RDME_VERSION openapi upload [url-or-local-path-to-file] --key=$README_API_KEY
```
{/* prettier-ignore-end */}

If you notice any issues with any of these examples, please open up an issue on [the `rdme` repository on GitHub](https://github.com/readmeio/rdme).

> 🚧 Secretly store your ReadMe API Key!
>
> Nearly every CI service has a way to securely add secrets so that they're not exposed in your scripts and build logs. We strongly recommend using such a feature for storing your ReadMe API key. The examples above use `$README_API_KEY`, which is how you typically load such variables in your scripts. We've included some links below on how to configure these for the respective examples:
>
> - [Bitbucket Pipelines](https://support.atlassian.com/bitbucket-cloud/docs/variables-and-secrets/#Secured-variables)
> - [CircleCI](https://circleci.com/docs/env-vars/)
> - [GitLab CI](https://docs.gitlab.com/ee/ci/variables/#add-a-cicd-variable-to-a-project)
> - [Travis CI](https://docs.travis-ci.com/user/environment-variables)

## Troubleshooting

If you're running into unexpected behavior with `rdme` and need to troubleshoot the issue, you have several debug logging options available. We may ask for these logs (as well as a copy of any files you're attempting to upload) when you contact our support team.

If you're working with the Markdown upload commands (e.g., `docs upload`, `reference upload`, etc.) specifically, we recommend using [dry run mode](#dry-run-mode) first so your docs don't get overwritten. If you're still seeing unexpected results (or are running into issues with any other command), check out the debugging options described below.

### Troubleshooting CLI

If you're troubleshooting issues with the CLI (or in some non-GitHub Actions environment), you can use the `DEBUG` environmental variable to print helpful debugging info to the console:

```sh
DEBUG=rdme* rdme openapi validate [url-or-local-path-to-file]
```

Note that this should only be used for development/debugging purposes and should not be enabled in production environments.

### Troubleshooting GitHub Actions

If you're troubleshooting issues in a GitHub Actions environment, you can enable [step debug logs](https://docs.github.com/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging#enabling-step-debug-logging) in your GitHub Actions workflow by [setting the repository secret](https://docs.github.com/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) `ACTIONS_STEP_DEBUG` to `true`. For more information on accessing, downloading, and deleting logs, check out [GitHub's documentation](https://docs.github.com/actions/monitoring-and-troubleshooting-workflows/using-workflow-run-logs).

> 🚧 Debug Logs May Contain Sensitive Information
>
> Enabling step debug logs will produce comprehensive logging for **all** of your GitHub Actions workflow steps. While GitHub automatically masks any sensitive information you load in with [secrets](#securely-using-your-api-key), there might be other sensitive information that's exposed. Anybody with read access to the repository will be able to see these logs.
>
> We **strongly recommend** that you only enable step debug logs in private repositories. If working in a public repository, we suggest recreating your GitHub workflow setup (e.g. with your GitHub workflow files, OpenAPI definitions, and anything else you need for syncing to ReadMe) in a separate private repository for testing purposes before enabling this setting.
>
> If you do enable step debug logs in your repository and your logs produce sensitive information, here are [GitHub's docs on deleting logs](https://docs.github.com/actions/monitoring-and-troubleshooting-workflows/using-workflow-run-logs#deleting-logs).
