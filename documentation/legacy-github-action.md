---
category: 5f7ce9e3a5504d0414d024c2
hidden: true
slug: automatically-sync-api-specification-with-github
title: OpenAPI + GitHub Sync [DEPRECATED]
---

<!--

Hello curious raw Markdown reader! 👋
This Markdown page is syncing to ReadMe via the `rdme` GitHub Action 🦉
Read more [on our main documentation page](rdme.md)

-->

> ❗️Deprecated in favor of [our new GitHub Action, `rdme`](https://docs.readme.com/docs/rdme) 🔄
>
> This GitHub Action has been deprecated in favor of our newer (and more fully-featured) GitHub Action, [`rdme`](https://docs.readme.com/docs/rdme), which has support for syncing OpenAPI files, syncing Markdown files, and much more.
>
> If you previously used ReadMe's [legacy GitHub Action](#legacy-docs), you are welcome to continue doing so if it's working for you. It will continue to run in existing workflows for the foreseeable future, but all development and support for this tool has been closed. To ensure your workflows continue to operate and are taking advantage of our latest features, we strongly recommend switching to [`rdme`](https://docs.readme.com/docs/rdme). Check out the migration guide below!

## Migrating to `rdme`

If you previously had a GitHub Workflow file set up that used this action to sync your OpenAPI file to ReadMe, you had a step in your workflow that looked something like this:

```yml
- uses: readmeio/github-readme-sync@v2
  with:
    readme-oas-key: <<user>>:API_DEFINITION_ID
    oas-file-path: path/to/file.json
    api-version: 'v1.0.0'
```

where the `readme-oas-key` was a concatenation of `<<user>>` (the API key for <<name>>) and `API_DEFINITION_ID` (your API definition ID), separated by a colon.

For migrating to [the `rdme`-based GitHub Action](https://docs.readme.com/docs/rdme), modify the step to look like this:

```yml
- uses: readmeio/rdme@RDME_VERSION
  with:
    rdme: openapi path/to/file.json --key=<<user>> --id=API_DEFINITION_ID
```

There are a few things to note:

1. This workflow will infer the `api-version` based on the `API_DEFINITION_ID` parameter that you pass in, so the API version parameter is no longer needed here.
2. `@RDME_VERSION` is the latest version of `rdme`. To ensure you're getting the latest features and security updates, we strongly recommend setting up [Dependabot](https://docs.github.com/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/keeping-your-actions-up-to-date-with-dependabot) to keep this package up-to-date.
3. If you used secrets to encrypt the `readme-oas-key` value, you'll have to split this value out into two separate secrets—one for the API key and one for the API definition ID. You can see an example of this [here](https://docs.readme.com/docs/rdme#example-using-github-secrets).

<details>

<summary>View the legacy docs below!</summary>

## Legacy Docs

With [GitHub Actions](https://github.com/features/actions), you can automatically sync your OpenAPI document whenever changes occur in your GitHub repo!

> ❗️Deprecated workflow instructions below
>
> As a reminder, the `readmeio/github-readme-sync` GitHub Action that's described below is now deprecated. The instructions are preserved for posterity. We strongly recommend all new and existing workflows use our newest GitHub Action: [`rdme`](https://docs.readme.com/docs/rdme)!

Create a new file in your GitHub repository called `.github/workflows/readme-github-sync.yml` and populate it with the template below. You only fill in one parameter from the ReadMe Dashboard and you'll be good to go!

Any subsequent commits to the `main` or `master` branch (whichever is your default branch—you can also specify any GitHub event of your choice—see [GitHub's docs](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions#on) for more info) will automatically trigger the sync process and upload your specified OpenAPI file to ReadMe.

```yaml .github/workflows/readme-api-sync.yml
name: Sync OAS to ReadMe
on:
  push:
    branches:
      - main
      - master
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: readmeio/github-readme-sync@v2
        with:
          readme-oas-key: 'unique-key-from-dashboard'

          # OPTIONAL CONFIG, use if necessary
          # oas-file-path: './swagger.json'
          # api-version: 'v1.0.0'
```

> 🚧 Public Repo? Secretly store your ReadMe API Key!
>
> GitHub Actions have a way to securely store sensitive information (such as your ReadMe API Key and API Specification ID), so it isn't publicly visible. You can read more [in their documentation](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#creating-encrypted-secrets).

| Parameter      | Description                                                                                                                                                                                                                                                                                     |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| readme-oas-key | **Required** This value can be obtained from the project dashboard when adding a new API to your project. For migrating existing APIs, see [here](#migrating-existing-apis-to-github-sync).                                                                                                     |
| oas-file-path  | **Optional** Path to OpenAPI document that will be synced to ReadMe. By default, we try to find the spec file in the directory automatically (i.e. if it's a JSON or YAML file with filenames like `swagger`, `oas`, or `openapi`).                                                             |
| api-version    | **Optional** Existing ReadMe Version to upload to. By default, we use the version specified in the spec file.[Versions in ReadMe](doc:versions) and [specifying the version in the OpenAPI Info object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#info-object) |

### Migrating Existing APIs to GitHub Sync

You can also migrate APIs that are already synced into ReadMe via another mechanism. The value for `readme-oas-key` is your [ReadMe Project API Key](https://docs.readme.com/developers/docs/authentication#api-key-quick-start) and the API Specification ID (pictured below) separated by a colon (i.e. `apiKey:apiSpecId`).

![](https://files.readme.io/9a89ed3-id.png)

Use `readme-oas-key` in your `.github/workflows/readme-github-sync.yml` file and any subsequent pushes to the `master` branch (or whichever branch(es) you specify in your workflow file) in that GitHub repository will sync that OpenAPI file to ReadMe!

> 📘 Keeping Your GitHub Action Up-to-Date
>
> To ensure that you're on the latest version of our GitHub Action (along with all of your project dependencies), we highly recommend [setting up Dependabot](https://docs.github.com/en/free-pro-team@latest/github/administering-a-repository/enabling-and-disabling-version-updates), which automatically updates your project dependencies (including this one!). As a fallback, we recommend keeping your version of the `github-readme-sync` package set to `v2` as denoted above, which ensures that your workflow will execute the latest available version within the version 2 range.

### Troubleshooting

If you're seeing failures with the GitHub Action and need to troubleshoot the issue, we provide comprehensive step-by-step debug logs. We may ask for these logs (as well as a copy of your API specification file) when you contact our support team. You can enable [Step Debug Logs](https://github.com/actions/toolkit/blob/main/docs/action-debugging.md#step-debug-logs) in your GitHub Actions workflow by [setting the repository secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#creating-encrypted-secrets) `ACTIONS_STEP_DEBUG` to `true`. For more information on accessing, downloading, and deleting logs, check out [GitHub's documentation](https://docs.github.com/en/free-pro-team@latest/actions/managing-workflow-runs/using-workflow-run-logs).

> 🚧 Debug Logs May Contain Sensitive Information
>
> Enabling [Step Debug Logs](https://github.com/actions/toolkit/blob/main/docs/action-debugging.md#step-debug-logs) will produce comprehensive logging for **all** of your GitHub Action workflows. While we sanitize all logging output to prevent API keys from being visible, the logs may contain other sensitive information (from ReadMe and any other services that you use). Anybody with read access to the repository will be able to see these logs.
>
> We **strongly recommend** that you only enable this setting in private repositories. If working in a public repository, we suggest creating a separate private repository with your GitHub workflow and OpenAPI/Swagger files before enabling this debugger.
>
> If you do enable Step Debug Logs in your repository and your logs produce sensitive information, here are [GitHub's docs on deleting logs](https://docs.github.com/en/free-pro-team@latest/actions/managing-workflow-runs/using-workflow-run-logs#deleting-logs).

### Example

Want to see the GitHub Action in action? Check out this example repository: [kanadgupta/metrotransit-nextrip-oas](https://github.com/kanadgupta/metrotransit-nextrip-oas)

To see an example where multiple OpenAPI/Swagger files are synced in the same repository, check out [jesseyowell/oas-test-files](https://github.com/jesseyowell/oas-test-files).
