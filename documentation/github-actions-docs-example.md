---
title: 'GitHub Actions Example: Syncing Markdown'
category: 62056dee230e07007218be06
---

<!--

Hello curious raw Markdown reader! 👋
This Markdown page is syncing to ReadMe via the `rdme` GitHub Action 🦉
Check out the full example below,
and peep the resulting page in our docs: https://docs.readme.com/docs/github-actions-docs-example

We also do some fancy little find-and-replace action to swap out every instance
of `RDME_VERSION` below with the latest version of rdme.
Check out `.github/workflows/docs.yml` for more info on this!

-->

Do you have Markdown files stored on GitHub? With [the `rdme` GitHub Action](https://docs.readme.com/docs/rdme), you can sync them to ReadMe every time they're updated in GitHub. Let's go over how to set this up!

## "Automagical" Workflow File Generation

To set up a GitHub Actions workflow for syncing a directory of Markdown docs, the fastest and easiest way to do so is by running the following command on your local machine:

```sh
rdme docs [path-to-directory-of-markdown] --github
```

This will scan the directory for Markdown files, sync them to ReadMe, and then create your GitHub Actions workflow file. Once that's done, create your [repository secret](https://docs.github.com/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository), push your workflow file to GitHub, and get syncing! 🎊

## Constructing a GitHub Actions Workflow File By Hand

> 🚧 Wait — there’s an easier way to do this!
>
> The information below is useful if you have experience using GitHub Actions, but for most folks, we recommend using the steps [detailed above](#automagical-workflow-file-generation). The `rdme` CLI will ask you a few questions before automatically creating the GitHub Actions workflow file for you, complete with every parameter you need to get syncing.

In order to construct the file by hand, you'll first want to grab a project version to ensure that your docs sync to the right place in your developer hub. That version will be passed via the `--version` flag. See below for a full example:

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
          rdme: docs ./documentation --key=${{ secrets.README_API_KEY }} --version=2.0
```

In the example above, every push to the `main` branch will sync the Markdown contents of the `documentation` directory to version 2.0 of your ReadMe project.

> 📘 Keeping `rdme` up-to-date
>
> Note that `@RDME_VERSION` (used in the above example) is the latest version of `rdme`. We recommend [configuring Dependabot to keep your actions up-to-date](https://docs.github.com/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot).
