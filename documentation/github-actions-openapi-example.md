---
title: 'GitHub Actions Example: Syncing OpenAPI'
category: 62056dee230e07007218be06
---

<!--

Hello curious raw Markdown reader! 👋
This Markdown page is syncing to ReadMe via the `rdme` GitHub Action 🦉
Peep the resulting page in our docs: https://docs.readme.com/docs/github-actions-openapi-example

We also do some fancy little find-and-replace action to swap out every instance
of `RDME_VERSION` below with the latest version of rdme.
Check out `.github/workflows/docs.yml` for more info on this!

-->

Is your OpenAPI definition stored on GitHub? With [the `rdme` GitHub Action](https://docs.readme.com/docs/rdme), you can sync it to ReadMe every time it's updated in GitHub. Let's go over how to set this up!

## "Automagical" Workflow File Generation

To set up a GitHub Actions workflow for syncing an OpenAPI or Swagger definition, the fastest and easiest way to do so is by running the following command on your local machine:

```sh
rdme openapi --github
```

This will locate your OpenAPI definition, sync it to ReadMe, and then create your GitHub Actions workflow file. Once that's done, create your [repository secret](https://docs.github.com/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository), push your workflow file to GitHub, and get syncing! 🎊

## Constructing a GitHub Actions Workflow File By Hand

> 🚧 Wait — there’s an easier way to do this!
>
> The information below is useful if you have experience using GitHub Actions, but for most folks, we recommend using the steps [detailed above](#automagical-workflow-file-generation). The `rdme` CLI will ask you a few questions before automatically creating the GitHub Actions workflow file for you, complete with every parameter you need to get syncing.

In order to construct the file by hand, you'll first want to obtain a unique API definition ID from ReadMe so we know which definition you want to update on subsequent re-syncs. You can obtain this API definition ID in one of several ways, but we'll dive into two below: uploading a file directly into the ReadMe dashboard and using the `rdme` CLI locally.

<details>
<summary>Uploading a file</summary>

Follow [these instructions](https://docs.readme.com/docs/openapi#file-upload) on uploading a new OpenAPI file in the dashboard. Once the file is uploaded, you'll see the following in the API Reference settings of your dashboard (the red outline is where you'll find your API definition ID):

![](https://files.readme.io/d57b7c8-Screen_Shot_2022-02-23_at_11.54.21_AM.png)

</details>
<details>
<summary>Using the <code>rdme</code> CLI</summary>

Alternatively, you can obtain the API definition ID by running the following `rdme` CLI command on your local machine:

```sh
rdme openapi [url-or-local-path-to-file]
```

Once you follow the prompts and upload your OpenAPI definition, you'll receive a confirmation message that looks something like this:

```
You've successfully updated an OpenAPI file on your ReadMe project!

        http://dash.readme.com/project/{your_project}/v1.0/refs/pet

To update your OpenAPI definition, run the following:

        rdme openapi [url-or-local-path-to-file] --key=<key> --id=API_DEFINITION_ID
```

</details>

We have a walkthrough video available which goes over the whole end-to-end process of obtaining the API definition ID and constructing the GitHub Actions workflow file:

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

Once you've obtained your API definition ID (let's call it `API_DEFINITION_ID`), your full GitHub Workflow file will look something like this:

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

      # Run GitHub Action to sync OpenAPI file at ./path-to-file.json
      - name: GitHub Action
        # We recommend specifying a fixed version, i.e. @RDME_VERSION
        # Docs: https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#example-using-versioned-actions
        uses: readmeio/rdme@RDME_VERSION
        with:
          rdme: openapi ./path-to-file.json --key=${{ secrets.README_API_KEY }} --id=API_DEFINITION_ID
```

In the example above, every push to the `main` branch will sync the OpenAPI file located at `./path-to-file.json` to the API specification `API_DEFINITION_ID` in your ReadMe project.

> 📘 Keeping `rdme` up-to-date
>
> Note that `@RDME_VERSION` (used in the above example) is the latest version of `rdme`. We recommend [configuring Dependabot to keep your actions up-to-date](https://docs.github.com/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot).
