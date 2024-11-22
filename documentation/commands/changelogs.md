`rdme changelogs`
=================

Sync Markdown files to your ReadMe project as Changelog posts. Can either be a path to a directory or a single Markdown file.

* [`rdme changelogs PATH`](#rdme-changelogs-path)

## `rdme changelogs PATH`

Sync Markdown files to your ReadMe project as Changelog posts. Can either be a path to a directory or a single Markdown file.

```
USAGE
  $ rdme changelogs PATH --key <value> [--github] [--dryRun]

ARGUMENTS
  PATH  Path to a local Markdown file or folder of Markdown files.

FLAGS
  --dryRun       Runs the command without creating/updating any changelogs in ReadMe. Useful for debugging.
  --github       Create a new GitHub Actions workflow for this command.
  --key=<value>  (required) ReadMe Project API key

DESCRIPTION
  Sync Markdown files to your ReadMe project as Changelog posts. Can either be a path to a directory or a single
  Markdown file.
```
