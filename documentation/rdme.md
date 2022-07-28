---
title: Syncing Docs via CLI / GitHub
excerpt: Update your docs automatically with `rdme`, ReadMe's official CLI and GitHub Action!
category: 5f7ce9e3a5504d0414d024c2
---

<!--

Hello curious raw Markdown reader! 👋
This Markdown page is syncing to ReadMe via the `rdme` GitHub Action 🦉
Check out the "Syncing Markdown Docs" example below,
and peep the resulting page in our docs: https://docs.readme.com/docs/rdme

We also do some fancy little find-and-replace action to swap out every instance
of `RDME_VERSION` below with the latest version of rdme.
Check out `.github/workflows/docs.yml` for more info on this!

-->

If you're anything like us, your documentation process may be a part of a broader CI/CD process. For example, you may want to automatically update your ReadMe guides or API reference every time you've ship new code. Enter `rdme`: ReadMe's official command-line interface (CLI) and GitHub Action!

[![npm](https://img.shields.io/npm/v/rdme)](https://npm.im/rdme) [![Build](https://github.com/readmeio/rdme/workflows/CI/badge.svg)](https://github.com/readmeio/rdme)

With `rdme`, you can create workflows for a variety of use cases, including:

- Syncing [OpenAPI/Swagger](https://docs.readme.com/docs/openapi) definitions (with support for bundling external references) 📦
- Pre-upload validation (including OpenAPI 3.1) ✅
- Syncing directories of Markdown files 📖

## General Setup and Usage

To see detailed CLI setup instructions and all available commands, check out [the `rdme` GitHub repository](https://github.com/readmeio/rdme#readme).

### Markdown File Setup

> 📘 Guides, Changelog, Custom Pages... you name it!
>
> The following guidance on Markdown file setup is nearly identical for Guides, Changelog, and Custom Pages. There are a couple of small diferences:
>
> - Guides is tied to project version and therefore it requires a `--version` parameter. Changelog and Custom Pages are the same across project versions and therefore do not have a `--version` parameter.
> - There are slight variations in the YAML front matter attributes for each respective section of your documentation. For example, Changelog has a `type` attribute which you can set to `added`. See [Specifying Other Attributes](#specifying-other-attributes) for more information.
> - In addition to Markdown, Custom Pages also supports HTML files. If you pass an HTML file into the `custompages` commands, the page will have the `htmlmode` flag set to `true` and it will conversely be set to `false` for Markdown files. You can override this in the YAML front matter.

In order to sync a directory of Markdown files to your guides, your Changelog, or your Custom Pages, you'll need to add certain attributes to the top of each page via a [YAML front matter block](https://jekyllrb.com/docs/front-matter/). See below for an example (using the page you're currently reading!):

```markdown
---
title: Syncing Docs via CLI / GitHub
excerpt: Update your docs automatically with `rdme`, ReadMe's official CLI and GitHub Action!
category: 5f7ce9e3a5504d0414d024c2
---

If you're anything like us...
```

The only required attributes are the `title` and `category`. To determine what your `category` value should be, you can use [the `Get all categories` endpoint](https://docs.readme.com/reference/getcategories) and grab the `id` value from the response.

#### Specifying Page Slugs

By default, we automatically derive the page's slug via the file name (e.g. the file name `rdme.md` would become `/docs/rdme` in your ReadMe project). Note that our API uses [`slugify`](https://www.npmjs.com/package/slugify) to automatically handle certain characters (e.g. spaces), which may lead to unexpected syncing behavior if your file names don't match your page slugs. If you prefer to keep your page slugs different from your file names, you can manually set the `slug` value in the YAML front matter:

```markdown
---
title: Syncing Docs via CLI / GitHub
excerpt: Update your docs automatically with `rdme`, ReadMe's official CLI and GitHub Action!
category: 5f7ce9e3a5504d0414d024c2
slug: an-alternative-page-slug-example
---
```

#### Specifying Other Attributes

You can also specify several other page attributes in your YAML front matter, such as `hidden` (a boolean which denotes whether your page is published or unpublished). Any attributes you omit will remain unchanged on `rdme` runs. To view the full list of attributes, check out the `POST` endpoints for respective section of your documentation that you're syncing:

- [`Create doc`](https://docs.readme.com/reference/createdoc)
- [`Create changelog`](https://docs.readme.com/reference/createchangelog)
- [`Create custom page`](https://docs.readme.com/reference/createcustompage)

#### Dry Run Mode

If you're setting up new pages or if you're generally unsure if you've set up your page attributes correctly, each command has a dry run mode. This will allow you preview the changes without actually creating/updating any docs in ReadMe, which can be extremely useful for initial setup (oh, and we have [comprehensive debugging options](#troubleshooting) available as well!). To enable dry run mode, use the `--dryRun` flag:

```sh
rdme docs path-to-markdown-files --version={project-version} --dryRun
rdme changelogs path-to-markdown-files --dryRun
rdme custompages path-to-markdown-files --dryRun
```

The command output will indicate whether each page is being created or updated alongside all processed page attributes.

## GitHub Actions Usage

With [GitHub Actions](https://docs.github.com/actions), you can automatically execute workflows when certain events take place in your GitHub repository (e.g. code is pushed to the default branch, a new pull request is opened, etc.).

While there are [dozens of event options available](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows), you'll typically want to sync your OpenAPI definition and Markdown docs to ReadMe [when a new build is deployed](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#deployment) or [when a new release is created](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#release). If you're not using either of those features then you can sync to ReadMe [when code is pushed to the default branch](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#push).

> 📘 Keeping `rdme` up-to-date
>
> Note that the `@RDME_VERSION` in the below examples is the latest version of `rdme`. We recommend [configuring Dependabot to keep your actions up-to-date](https://docs.github.com/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/keeping-your-actions-up-to-date-with-dependabot).

For usage in GitHub Actions, create [a new GitHub Workflow file](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions) in the `.github/workflows` directory of your repository and add the following [steps](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idsteps) to your workflow:

```yml
- uses: actions/checkout@v3
- uses: readmeio/rdme@RDME_VERSION
  with:
    rdme: [your command here]
```

The command syntax in GitHub Actions is functionally equivalent to the CLI. For example, take the following CLI command:

```sh
rdme openapi [path-to-file.json] --key=<<user>> --id=API_DEFINITION_ID
```

To execute this command via GitHub Actions, the step would look like this:

```yml
- uses: readmeio/rdme@RDME_VERSION
  with:
    rdme: openapi [path-to-file.json] --key=<<user>> --id=API_DEFINITION_ID
```

We'll dive into several full GitHub Workflow file examples (including a video demo) below!

### Example: Syncing an OpenAPI Definition

<!--
This is a custom HTML block that we use in ReadMe.
We'll need this to render an iframe of the Loom video demo.
Using our embedly-powered embed block renders an iframe that's way too tall, hence we're using HTML.
You can see the video here: https://www.loom.com/share/e32c20a9dc2f4eeeab42d0c18ba24478
-->

[block:html]
{
"html": "<div style=\"position: relative; padding-bottom: 62.5%; height: 0;\"><iframe src=\"https://www.loom.com/embed/e32c20a9dc2f4eeeab42d0c18ba24478\" frameborder=\"0\" webkitallowfullscreen mozallowfullscreen allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe></div>"
}
[/block]

To sync an OpenAPI or Swagger definition, you'll first want to obtain a unique API definition ID from ReadMe so we know which definition you want to update on subsequent re-syncs. You can obtain this API definition ID in one of several ways, but we'll dive into two below: uploading a file directly into the ReadMe dashboard and using the `rdme` CLI locally.

<details>
<summary>Uploading a file</summary>

Follow [these instructions](https://docs.readme.com/docs/openapi#file-upload) on uploading a new OpenAPI file in the dashboard. Once the file is uploaded, you'll see the following in the API Reference settings of your dashboard (the red outline is where you'll find your API definition ID):

![](https://files.readme.io/d57b7c8-Screen_Shot_2022-02-23_at_11.54.21_AM.png)

</details>
<details>
<summary>Using the <code>rdme</code> CLI</summary>

Alternatively, you can obtain the API definition ID by running the following `rdme` CLI command on your local machine:

```sh
rdme openapi [path-to-file.json]
```

Once you follow the prompts and upload your OpenAPI definition, you'll receive a confirmation message that looks something like this:

```
You've successfully updated an OpenAPI file on your ReadMe project!

        http://dash.readme.com/project/{your_project}/v1.0/refs/pet

To update your OpenAPI definition, run the following:

        rdme openapi [path-to-file.json] --key=<<user>> --id=API_DEFINITION_ID
```

</details>

Once you've obtained your API definition ID, your full GitHub Workflow file will look something like this:

```yml
name: Sync OpenAPI definition to ReadMe

# Run workflow for every push to the `main` branch
on:
  push:
    branches:
      - main

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout this repo
        uses: actions/checkout@v3

      # Run GitHub Action to sync OpenAPI file at [path-to-file.json]
      - name: GitHub Action
        # We recommend specifying a fixed version, i.e. @RDME_VERSION
        # Docs: https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#example-using-versioned-actions
        uses: readmeio/rdme@RDME_VERSION
        with:
          rdme: openapi [path-to-file.json] --key=<<user>> --id=API_DEFINITION_ID
```

In the example above, every push to the `main` branch will check out your repository's contents and sync the OpenAPI file located at `./path-to-file.json` with your ReadMe project.

### Example: Syncing Markdown Docs

Not to get too meta on you, but... the page that you're currently reading is actually being synced from the `rdme` GitHub repository via the `rdme` GitHub Action! Here are the relevant files on GitHub:

- [The Markdown source file for the page you're reading](https://github.com/readmeio/rdme/blob/main/documentation/rdme.md) 📜
- [The GitHub Action workflow file that syncs the Markdown to docs.readme.com](https://github.com/readmeio/rdme/blob/main/.github/workflows/docs.yml) 🔄
- And finally... [the workflow run results](https://github.com/readmeio/rdme/actions/workflows/docs.yml) ✅

To recreate this magic in your repository, your GitHub Workflow file will look something like this:

```yml
name: Sync `documentation` directory to ReadMe

# Run workflow for every push to the `main` branch
on:
  push:
    branches:
      - main

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout this repo
        uses: actions/checkout@v3

      # Run GitHub Action to sync docs in `documentation` directory
      - name: GitHub Action
        # We recommend specifying a fixed version, i.e. @RDME_VERSION
        # Docs: https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#example-using-versioned-actions
        uses: readmeio/rdme@RDME_VERSION
        with:
          rdme: docs ./documentation --key=<<user>> --version=2.0
```

In the example above, every push to the `main` branch will check out your repository's contents and sync the contents of the `documentation` directory with your ReadMe project.

### Example: Using GitHub Secrets

> 🚧 Secretly store your ReadMe API Key!
>
> GitHub Actions has [secrets](https://docs.github.com/actions/security-guides/encrypted-secrets) to securely store sensitive information so it isn't publicly visible. We **strongly** recommend using these for storing your ReadMe API Key, your API definition ID, and any other secret keys—whether your repository is public or private. You can read more about setting these up [in their documentation](https://docs.github.com/actions/security-guides/encrypted-secrets).

To use a GitHub secret in your `rdme` GitHub Action, first [create a new repository secret](https://docs.github.com/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). Let's say you create a new secret key called `README_API_KEY`. The usage in the `rdme` step will look something like this:

```yml
- uses: readmeio/rdme@RDME_VERSION
  with:
    rdme: openapi [path-to-file.json] --key=${{ secrets.README_API_KEY }} --id=${{ secrets.README_API_DEFINITION_ID }}
```

## Usage in Other CI Environments

Since `rdme` is a command-line tool at its core, you can use `rdme` to sync your documentation from virtually any CI/CD environment that runs shell commands—[Bitbucket Pipelines](https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/), [GitLab CI/CD](https://docs.gitlab.com/ee/ci/), you name it! You can do this by invoking `rdme` with `npx -y rdme@RDME_VERSION` in a Node.js environment. See below for several examples.

<!--
The two code blocks below must be joined (i.e. no newline in between) in order to render as tabbed code blocks in ReadMe.

Unfortunately we need to ignore both code blocks entirely so Prettier doesn't separate them.
-->

<!-- prettier-ignore-start -->
```yml Bitbucket Pipelines (bitbucket-pipelines.yml)
# Official framework image. Look for the different tagged releases at:
# https://hub.docker.com/r/library/node/tags/
image: node:NODE_VERSION
pipelines:
  default:
    - step:
        script:
          - npx -y rdme@RDME_VERSION openapi [path-to-file.json] --key=<<user>> --id=API_DEFINITION_ID
```
```yml GitLab CI (rdme-sync.gitlab-ci.yml)
# Official framework image. Look for the different tagged releases at:
# https://hub.docker.com/r/library/node/tags/
image: node:NODE_VERSION

sync-via-rdme:
  script:
    - npx -y rdme@RDME_VERSION openapi [path-to-file.json] --key=<<user>> --id=API_DEFINITION_ID
```
<!-- prettier-ignore-end -->

## Troubleshooting

If you're running into unexpected behavior with `rdme` and need to troubleshoot the issue, you have several debug logging options available. We may ask for these logs (as well as a copy of your OpenAPI definition) when you contact our support team.

If you're working with the `docs` command specifically, we recommend using [dry run mode](#dry-run-mode) first so your docs don't get overwritten. If you're still seeing unexpected results (or are running into issues with any other command), check out the debugging options described below.

### Troubleshooting CLI

If you're troubleshooting issues with the CLI (or in some non-GitHub Actions environment), you can use the `DEBUG` environmental variable to print helpful debugging info to the console:

```sh
DEBUG=rdme* rdme openapi [path-to-file.json]
```

Note that this should only be used for development/debugging purposes and should not be enabled in production environments.

### Troubleshooting GitHub Actions

If you're troubleshooting issues in a GitHub Actions environment, you can enable [step debug logs](https://docs.github.com/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging#enabling-step-debug-logging) in your GitHub Actions workflow by [setting the repository secret](https://docs.github.com/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) `ACTIONS_STEP_DEBUG` to `true`. For more information on accessing, downloading, and deleting logs, check out [GitHub's documentation](https://docs.github.com/actions/monitoring-and-troubleshooting-workflows/using-workflow-run-logs).

> 🚧 Debug Logs May Contain Sensitive Information
>
> Enabling step debug logs will produce comprehensive logging for **all** of your GitHub Action workflow steps. While GitHub automatically masks any sensitive information you load in with [secrets](#example-using-github-secrets), there might be other sensitive information that's exposed. Anybody with read access to the repository will be able to see these logs.
>
> We **strongly recommend** that you only enable step debug logs in private repositories. If working in a public repository, we suggest recreating your GitHub workflow setup (e.g. with your GitHub workflow files, OpenAPI definitions, and anything else you need for syncing to ReadMe) in a separate private repository for testing purposes before enabling this setting.
>
> If you do enable step debug logs in your repository and your logs produce sensitive information, here are [GitHub's docs on deleting logs](https://docs.github.com/actions/monitoring-and-troubleshooting-workflows/using-workflow-run-logs#deleting-logs).
