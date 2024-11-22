`rdme custompages`
==================

Sync Markdown/HTML files to your ReadMe project as Custom Pages. Can either be a path to a directory or a single Markdown/HTML file.

* [`rdme custompages PATH`](#rdme-custompages-path)

## `rdme custompages PATH`

Sync Markdown/HTML files to your ReadMe project as Custom Pages. Can either be a path to a directory or a single Markdown/HTML file.

```
USAGE
  $ rdme custompages PATH --key <value> [--github] [--dryRun]

ARGUMENTS
  PATH  Path to a local Markdown file or folder of Markdown files.

FLAGS
  --dryRun       Runs the command without creating/updating any custom pages in ReadMe. Useful for debugging.
  --github       Create a new GitHub Actions workflow for this command.
  --key=<value>  (required) ReadMe Project API key

DESCRIPTION
  Sync Markdown/HTML files to your ReadMe project as Custom Pages. Can either be a path to a directory or a single
  Markdown/HTML file.
```
