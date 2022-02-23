---
title: CLI + GitHub Action Usage
excerpt: Learn more about `rdme`, ReadMe's official CLI and GitHub Action!
category: 5f7ce9e3a5504d0414d024c2
---

<!--

Hello curious raw Markdown reader! 👋
This Markdown page is syncing to ReadMe via the `rdme GitHub Action 🦉
Check out the "Syncing Markdown Docs" example below,
and peep the resulting page in our docs: https://docs.readme.com/docs/rdme

-->

If you're anything like us, your documentation process may be a part of a broader [CI/CD](https://en.wikipedia.org/wiki/CI/CD) process. For example, you may want to automatically update your ReadMe guides or API reference every time you've ship new code. Enter [`rdme`](https://github.com/readmeio/rdme): ReadMe's official command-line interface (CLI) and GitHub Action!

With `rdme`, you can create workflows for a variety of use cases, including:

- Syncing [OpenAPI/Swagger](https://docs.readme.com/docs/openapi) definitions (with support for bundling external references) 📦
- Pre-upload validation (including OpenAPI 3.1) ✅
- Syncing directories of Markdown files 📖

## General Setup and Usage

To see detailed CLI setup instructions and all available commands, check out [the `rdme` GitHub repository](https://github.com/readmeio/rdme#readme).

### Markdown File Setup

In order to sync a directory of Markdown files to your guides, you'll need to add certain attributes to the top of each page via a [YAML front matter block](https://jekyllrb.com/docs/front-matter/). See below for an example (using the page you're currently reading!):

```markdown
---
title: CLI + GitHub Action Usage
excerpt: Learn more about `rdme`, ReadMe's official CLI and GitHub Action!
category: 5f7ce9e3a5504d0414d024c2
---

If you're anything like us...
```

The only required attributes are the `title` and `category`. To determine what your `category` value should be, you can use [the Get all categories endpoint](https://docs.readme.com/reference/getcategories) and grab the `id` value from the response.

We automatically derive the page's slug via the file name (e.g. the file name `rdme.md` would become `/docs/rdme` in your ReadMe project), but you can override that as well:

```markdown
---
title: CLI + GitHub Action Usage
excerpt: Learn more about `rdme`, ReadMe's official CLI and GitHub Action!
category: 5f7ce9e3a5504d0414d024c2
slug: an-alternative-page-slug-example
---
```

You can also specify several other page attributes in your YAML front matter, such as `hidden` (a boolean which denotes whether your page is published or unpublished). Any attributes you omit will remain unchanged on `rdme` runs. To view the full list of attributes, check out our [`Create doc` endpoint documentation](https://docs.readme.com/reference/createdoc).

## GitHub Actions Usage

[GitHub Actions](https://docs.github.com/actions) makes it easy to automatically execute workflows when certain events take place in your GitHub repository (e.g. new code is merged into the default branch, a new pull request is opened, etc.).

<!-- TODO: it might be nice to have some sort of CI workflow that auto-updates the version in the examples below! -->
<!-- TODO: populate marketplace listing link! -->

> 📘 Keeping `rdme` up-to-date
>
> Note that the `@XX` in the below examples refers to the version of `rdme` (e.g. `@7.0`), which you can find in [the Marketplace listing](). We recommend [configuring Dependabot to keep your actions up-to-date](https://docs.github.com/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/keeping-your-actions-up-to-date-with-dependabot).

For usage in [GitHub Actions](https://docs.github.com/actions), create [a new GitHub Workflow file](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions) in the `.github/workflows` directory of your repository and add the following [steps](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idsteps) to your workflow:

```yml
- uses: actions/checkout@v2
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

We'll dive into several full GitHub Workflow file examples below!

### Example: Syncing Markdown Docs

Not to get too meta on you, but... the page that you're currently reading is actually being synced from the `rdme` GitHub repository via the `rdme` GitHub Action! Here are a few links to the relevant files:

- [The Markdown source file for the page you're reading](https://github.com/readmeio/rdme/tree/main/docs/rdme.md)
- [The full GitHub Action workflow file that we use to sync the file to docs.readme.com](https://github.com/readmeio/rdme/blob/main/.github/workflows/docs.yml)
- And finally... [the workflow run results](https://github.com/readmeio/rdme/actions/workflows/docs.yml)!

To recreate this magic in your repository, your GitHub Workflow file will look like this:

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
        uses: actions/checkout@v2.4.0

      # Run GitHub Action to sync docs in `documentation` directory
      - name: GitHub Action
        # We recommend specifying a fixed version, i.e. @7.0
        # Docs: https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#example-using-versioned-actions
        uses: readmeio/rdme@XX
        with:
          rdme: docs ./documentation --key=API_KEY --version=2.0
```

In the example above, every push to the `main` branch will check out your repository's contents and sync the contents of the `documentation` directory with your ReadMe project.

### Example: Syncing an OpenAPI Definition

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

To update your OpenAPI or Swagger definition, run the following:

        rdme openapi FILE --key=API_KEY --id=API_DEFINITION_ID
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
        uses: actions/checkout@v2.4.0

      # Run GitHub Action to sync docs in `documentation` directory
      - name: GitHub Action
        # We recommend specifying a fixed version, i.e. @7.0
        # Docs: https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#example-using-versioned-actions
        uses: readmeio/rdme@XX
        with:
          rdme: openapi [path-to-file.json] --key=API_KEY --id=API_DEFINITION_ID
```

### Example: Using GitHub Secrets

> 🚧 Secretly store your ReadMe API Key!
>
> GitHub Actions has [secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) to securely store sensitive information so it isn't publicly visible. We **strongly** recommend using these for storing your ReadMe API Key, your API definition ID, and any other secret keys—whether your repository is public or private. You can read more about setting these up [in their documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets).

To use a GitHub secret in your `rdme` GitHub Action, first [create a new repository secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). Let's say you create a new secret key called `README_API_KEY`. The usage in the `rdme` step will look something like this:

```yml
- uses: readmeio/rdme@XX
  with:
    rdme: docs ./documentation --key=${{ secrets.README_API_KEY }} --version=2.0
```
