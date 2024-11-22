`rdme docs`
===========

Sync or prune Guides pages in your ReadMe developer hub.

* [`rdme docs PATH`](#rdme-docs-path)
* [`rdme docs:prune FOLDER`](#rdme-docsprune-folder)

## `rdme docs PATH`

Sync Markdown files to your ReadMe project as Guides. Can either be a path to a directory or a single Markdown file.

```
USAGE
  $ rdme docs PATH --key <value> [--version <value>] [--github] [--dryRun]

ARGUMENTS
  PATH  Path to a local Markdown file or folder of Markdown files.

FLAGS
  --dryRun           Runs the command without creating/updating any docs in ReadMe. Useful for debugging.
  --github           Create a new GitHub Actions workflow for this command.
  --key=<value>      (required) ReadMe Project API key
  --version=<value>  Project version. If running command in a CI environment and this option is not passed, the main
                     project version will be used.

DESCRIPTION
  Sync Markdown files to your ReadMe project as Guides. Can either be a path to a directory or a single Markdown file.

ALIASES
  $ rdme guides
```

## `rdme docs:prune FOLDER`

Delete any docs from ReadMe if their slugs are not found in the target folder.

```
USAGE
  $ rdme docs:prune FOLDER --key <value> [--version <value>] [--github] [--confirm] [--dryRun]

ARGUMENTS
  FOLDER  A local folder containing the files you wish to prune.

FLAGS
  --confirm          Bypass the confirmation prompt. Useful for CI environments.
  --dryRun           Runs the command without deleting any docs in ReadMe. Useful for debugging.
  --github           Create a new GitHub Actions workflow for this command.
  --key=<value>      (required) ReadMe Project API key
  --version=<value>  Project version. If running command in a CI environment and this option is not passed, the main
                     project version will be used.

DESCRIPTION
  Delete any docs from ReadMe if their slugs are not found in the target folder.

ALIASES
  $ rdme guides:prune
```
