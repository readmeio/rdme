# Migration Guide

This guide helps you migrate your ReadMe CLI (`rdme`) setup to the latest version and prepare for future versions. Choose your migration path based on whether you're using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored).

1. If your project is using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored), [use `rdme@v10`](#migrating-to-rdme10) and beyond.
2. If your project is **not** yet using ReadMe Refactored, [use `rdme@v9`](#migrating-to-rdme9). The `v9` channel will continue to be maintained while we focus on making sure that everybody can upgrade their ReadMe projects to ReadMe Refactored.

## Table of Contents

<!--

Autogenerated TOC — to regenerate:

npx markdown-toc documentation/migration-guide.md --maxdepth 2 --bullets="-" -i

 -->

<!-- toc -->

- [Migrating to `rdme@10`](#migrating-to-rdme10)
- [Migrating to `rdme@9`](#migrating-to-rdme9)
- [Migrating to `rdme@8`](#migrating-to-rdme8)
- [Version Compatibility Matrix](#version-compatibility-matrix)
- [Need Help?](#need-help)

<!-- tocstop -->

## Migrating to `rdme@10`

### Overview

This guide explains how to install `rdme@10` for use with [ReadMe Refactored]{https://docs.readme.com/main/docs/welcome-to-readme-refactored}. In general, we recommend [bi-directional syncing](https://docs.readme.com/main/docs/bi-directional-sync) for tasks like:

- Syncing Markdown files
- Syncing API definitions (and editing them visually with [the API designer](https://docs.readme.com/main/docs/building-apis-from-scratch-with-the-api-designer))
- Managing project hierarchy (e.g., versions and categories)

However `rdme@10` is useful for more targeted workflows—particularly when syncing happens outside of Git, such as:

- A one-directional sync of an API definition (e.g., if it is generated via a build process and/or is not tracked via your bidirectionally synced Git repo)
- A one-directional sync of Markdown files (e.g., if they are updated via a build process and/or are not tracked via your bidirectionally synced Git repo)
- Any non-syncing processing for an API definition (e.g., validating it, reducing it a set of fewer operations)

<!-- prettier-ignore-start -->
> [!NOTE]
> `rdme@10` only works with ReadMe projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored). If you are not yet using ReadMe Refactored, [you'll want to use `rdme@9`](#migrating-to-rdme9).
<!-- prettier-ignore-end -->

### Upgrading to `v10`

#### Step 1: Upgrade via `npm`

To install this version of the `rdme` CLI globally, run the following command:

```sh
npm install -g rdme@10
```

More installation options can be found in [our docs](https://github.com/readmeio/rdme/tree/v10?tab=readme-ov-file#setup).

#### Step 2: Update GitHub Actions Workflow

If you're using the `rdme` GitHub Action, update your GitHub Actions workflow file so your `rdme` usage uses the `v10` reference like so:

```yaml
- uses: readmeio/rdme@v10
  with:
    rdme: openapi validate petstore.json
```

#### Step 3: Address `v10` Breaking Changes

1. **Enable Bi-Directional Syncing** _(recommended)_

   We recommend setting up [bi-directional syncing](https://docs.readme.com/main/docs/bi-directional-sync) for managing your Markdown files, API definitions and project hierarchy.

2. **Command Replacements**
   - Replace: `openapi` → `openapi upload` (see more in step 3 below)
   - Replace: `categories` → use [Git-based workflow](https://docs.readme.com/main/docs/bi-directional-sync)
   - Replace: `custompages` → use [Git-based workflow](https://docs.readme.com/main/docs/bi-directional-sync)
   - Replace: `versions` → use [Git-based workflow](https://docs.readme.com/main/docs/bi-directional-sync)
   - Remove: `open`

3. **`openapi` has been replaced by `openapi upload`**

   If you previously uploaded API definitions to ReadMe via `rdme openapi`, the command is now `rdme openapi upload`. There are now two main updates:
   - There is no prompt to select your ReadMe project version if you omit the `--version` flag. It now defaults to `stable` (i.e., your main ReadMe project version).

   - Previously with `openapi`, the `--id` flag was an ObjectId that required an initial upload to ReadMe, which made it difficult to upsert API definitions and manage many at scale. With `openapi upload`, the `--id` flag has been renamed to `--slug` and is now optional. The slug (i.e., the unique identifier for your API definition resource in ReadMe) is inferred from the file path or URL to your API definition.

   Read more in [the `openapi upload` command docs](https://github.com/readmeio/rdme/tree/v10/documentation/commands/openapi.md#rdme-openapi-upload-spec) and in [the ReadMe API migration guide](https://docs.readme.com/main/reference/api-migration-guide).

## Migrating to `rdme@9`

### Overview

This release adds a few features that make it even easier to get started with `rdme`:

1. **Enhanced Command Documentation**
   - Complete command reference in [the `documentation/commands` directory](https://github.com/readmeio/rdme/tree/v9/documentation/commands)
   - Detailed usage examples and parameter descriptions
   - Structured by command category for intuitive navigation

2. **Improved CLI Experience**
   - Overhauled help screens with detailed examples to improve readability and ease of use
   - Set up CLI autocompletions with [the `autocomplete` command](https://github.com/readmeio/rdme/tree/v9/documentation/commands/autocomplete.md)
   - Smart command discovery that helps catch and correct typos
   - Redesigned error messages with clear resolution steps

<!-- prettier-ignore-start -->
> [!NOTE]
> `rdme@9` only works with ReadMe projects that are **not** using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored). If you are using ReadMe Refactored, [you'll want to use `rdme@10`](#migrating-to-rdme10).
<!-- prettier-ignore-end -->

### Upgrading to `v9`

#### Step 1: Upgrade via `npm`

To install this version of the `rdme` CLI globally, run the following command:

```sh
npm install -g rdme@9
```

More installation options can be found in [our docs](https://github.com/readmeio/rdme/tree/v9?tab=readme-ov-file#setup).

#### Step 2: Update GitHub Actions Workflow

If you're using the `rdme` GitHub Action, update your GitHub Actions workflow file so your `rdme` usage uses the `v9` reference like so:

```yaml
- uses: readmeio/rdme@v9
  with:
    rdme: openapi validate petstore.json
```

#### Step 3: Address `v9` Breaking Changes

1. **Verify your runtime**
   - For CLI users, make sure your Node.js version is up-to-date. The minimum required Node.js version for `rdme@9` is **v20.10.0**.
   - The `rdme` release process is no longer publishing Docker images and the GitHub Action is now a JavaScript action. This change should not affect any GitHub Actions users.

2. **Topic separator changes**
   - The topic separator (i.e., what separates a command from its subcommand) has changed from a colon to a space by default. For example, `rdme openapi:validate` is now `rdme openapi validate`.
   - The colon topic separator will continue to be supported so there is no need to change any existing commands, but all documentation and help screens will reflect the space topic separator.

3. **Command replacements**
   - Replace `swagger` → [`openapi`](https://github.com/readmeio/rdme/tree/v9/documentation/commands/openapi.md#rdme-openapi-spec)
   - Replace `validate` → [`openapi validate`](https://github.com/readmeio/rdme/tree/v9/documentation/commands/openapi.md#rdme-openapi-validate-spec)
   - Remove: `docs:edit`, `oas`

4. **Version flag updates**

   The CLI flags on [the `versions create` and `versions update` commands](https://github.com/readmeio/rdme/tree/v9/documentation/commands/versions.md) now maintain parity with [our API flags](https://docs.readme.com/main/reference/createversion). The `--isPublic` flag has been removed in favor of a new flag called `--hidden`, which is the inverse of `--isPublic`.

   **Before**

   ```bash
   rdme versions:create 1.0.1 --isPublic true
   ```

   **After**

   ```bash
   rdme versions create 1.0.1 --hidden false
   ```

5. **Deprecated commands**

   The following commands (and their subcommands) will be removed in `rdme@10`:
   - `categories`
   - `custompages`
   - `docs` (and its `guides` alias)
   - `versions`
   - `open`

   The `openapi` command will be replaced by `openapi upload` and will have a simpler flag setup based on community feedback.

6. **Verify any scripts that utilize raw CLI outputs**
   - The underlying architecture for the CLI has been rewritten with [`oclif`](https://oclif.io/), so some command outputs and error messages may look different.
   - With the exception of the `--raw` flag on `openapi`, we recommend relying on CLI exit codes in your workflows rather than raw command outputs.

## Migrating to `rdme@8`

Please see [the `rdme@8.0.0` release notes](https://github.com/readmeio/rdme/releases/tag/8.0.0).

## Version Compatibility Matrix

| Feature                                                                                                                                     | `v8`   | `v9`        | `v10`       |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- | ----------- |
| Actively Maintained?                                                                                                                        | ❌     | ✅          | ✅          |
| Support for [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored)\*                                           | ❌     | ❌          | ✅          |
| Supports Bi-Directional Sync                                                                                                                | ❌     | ❌          | ✅          |
| Support for Legacy Projects (i.e., not yet migrated to [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored)) | ✅     | ✅          | ❌          |
| Node.js Requirements                                                                                                                        | `>=14` | `>=20.10.0` | `>=20.10.0` |

\*If you uploaded an API definition prior to migrating your project to ReadMe Refactored, any existing workflows for syncing these files that use a legacy `rdme` version (i.e., `v9` or earlier) should continue to work, even after migrating. **For new workflows, we recommend following this migration guide and upgrading to the latest version.**

## Need Help?

If you notice any issues or disruptions to your workflow during migration, we're here to help! Feel free to...

- Open up an issue on GitHub 🆘
- Get in touch with us at [support@readme.io](mailto:support@readme.io) 📬
- Say hi on [Slack](https://readme.com/slack) 👋
