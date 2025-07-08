`rdme reference`
================

Upload Markdown files to the Reference section of your ReadMe project.

* [`rdme reference upload PATH`](#rdme-reference-upload-path)

## `rdme reference upload PATH`

Upload Markdown files to the Reference section of your ReadMe project.

```
USAGE
  $ rdme reference upload PATH --key <value> [--branch <value>] [--dry-run]

ARGUMENTS
  PATH  Path to a local Markdown file or folder of Markdown files.

FLAGS
  --key=<value>     (required) ReadMe project API key
  --branch=<value>  [default: stable] ReadMe project version
  --dry-run         Runs the command without creating nor updating any reference pages in ReadMe. Useful for debugging.

DESCRIPTION
  Upload Markdown files to the Reference section of your ReadMe project.

  The path can either be a directory or a single Markdown file.

  The Markdown files will require YAML frontmatter with certain ReadMe documentation attributes. Check out our docs for
  more info on setting up your frontmatter: https://docs.readme.com/main/docs/rdme#markdown-file-setup

EXAMPLES
  The path input can be a directory. This will also upload any Markdown files that are located in subdirectories:

    $ rdme reference upload documentation/ --branch={project-branch}

  The path input can also be individual Markdown files:

    $ rdme reference upload documentation/about.md --branch={project-branch}

  You can omit the `--branch` flag to default to the `stable` branch of your project:

    $ rdme reference upload [path]

  This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about
  dry run mode in our docs: https://docs.readme.com/main/docs/rdme#dry-run-mode

    $ rdme reference upload [path] --dry-run

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v10#authentication

  --branch=<value>  ReadMe project version

    Defaults to `stable` (i.e., your main project version).
```
