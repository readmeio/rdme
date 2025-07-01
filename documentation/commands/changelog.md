`rdme changelog`
================

Upload Markdown files to the Changelog section of your ReadMe project.

NOTE: This command is in an experimental alpha and is likely to change. Use at your own risk!

* [`rdme changelog upload PATH`](#rdme-changelog-upload-path)

## `rdme changelog upload PATH`

Upload Markdown files to the Changelog section of your ReadMe project.

```
USAGE
  $ rdme changelog upload PATH --key <value> [--dry-run]

ARGUMENTS
  PATH  Path to a local Markdown file or folder of Markdown files.

FLAGS
  --key=<value>  (required) ReadMe project API key
  --dry-run      Runs the command without creating nor updating any Changelog entries in ReadMe. Useful for debugging.

DESCRIPTION
  Upload Markdown files to the Changelog section of your ReadMe project.

  NOTE: This command is in an experimental alpha and is likely to change. Use at your own risk!

  The path can either be a directory or a single Markdown file. The Markdown files will require YAML frontmatter with
  certain ReadMe documentation attributes. Check out our docs for more info on setting up your frontmatter:
  https://docs.readme.com/main/docs/rdme#markdown-file-setup

EXAMPLES
  The path input can be a directory. This will also upload any Markdown files that are located in subdirectories:

    $ rdme changelog upload documentation/

  The path input can also be individual Markdown files:

    $ rdme changelog upload documentation/about.md

  This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about
  dry run mode in our docs: https://docs.readme.com/main/docs/rdme#dry-run-mode

    $ rdme changelog upload [path] --dry-run

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v10#authentication
```
