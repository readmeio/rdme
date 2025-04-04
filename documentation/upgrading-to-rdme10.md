---
title: Upgrading your ReadMe CLI to rdme@10
category:
  uri: Upgrading to ReadMe Refactored
---

### Overview

A [bi-directional syncing](https://docs.readme.com/main/docs/bi-directional-sync) workflow with [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored) mostly eliminates the need for a tool like `rdme`. For syncing Markdown files, syncing API definitions, and managing project hierarchy (e.g., project versions and categories) with ReadMe Refactored, you'll want to set up bi-directional syncing.

`rdme@10` is recommended for the following use cases:

- Syncing your API definition (generated via a build process and not tracked via Git) to your ReadMe Refactored-enabled project
- Syncing Markdown files to the Changelog for your ReadMe Refactored-enabled project

> ❗️
>
> `rdme@10` only works with ReadMe projects that are using [ReadMe Refactored](https://docs.readme.com/main/docs/welcome-to-readme-refactored). If you are not yet using ReadMe Refactored, [you'll want to use `rdme@9`](#migrating-to-rdme9).

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
   - Replace: `docs` (and its `guides` alias) → use [Git-based workflow](https://docs.readme.com/main/docs/bi-directional-sync)
   - Replace: `versions` → use [Git-based workflow](https://docs.readme.com/main/docs/bi-directional-sync)
   - Remove: `open`

3. **`openapi`has been replaced by`openapi upload`**

   If you previously uploaded API definitions to ReadMe via `rdme openapi`, the command is now `rdme openapi upload`. There are now two main updates:

   - There is no prompt to select your ReadMe project version if you omit the `--version` flag. It now defaults to `stable` (i.e., your main ReadMe project version).

   - Previously with `openapi`, the `--id` flag was an ObjectID that required an initial upload to ReadMe, which made it difficult to upsert API definitions and manage many at scale. With `openapi upload`, the `--id` flag has been renamed to `--slug` and is now optional. The slug (i.e., the unique identifier for your API definition resource in ReadMe) is inferred from the file path or URL to your API definition.

   Read more in [the `openapi upload` command docs](https://github.com/readmeio/rdme/tree/v10/documentation/commands/openapi.md#rdme-openapi-upload-spec).
