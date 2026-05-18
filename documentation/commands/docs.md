`rdme docs`
===========

Upload or export Guides in your ReadMe project.

* [`rdme docs export FOLDER`](#rdme-docs-export-folder)
* [`rdme docs upload PATH`](#rdme-docs-upload-path)

## `rdme docs export FOLDER`

Export Guides from your ReadMe project to local Markdown files.

```
USAGE
  $ rdme docs export FOLDER --key <value> [--branch <value>] [--docs-only]

ARGUMENTS
  FOLDER  Directory to write exported Markdown into.

FLAGS
  --key=<value>     (required) ReadMe project API key
  --branch=<value>  [default: stable] ReadMe project version
  --docs-only       Skip pages with an empty body unless the page type is `link`.

DESCRIPTION
  Export Guides from your ReadMe project to local Markdown files.

  Downloads Guides from your ReadMe project API for the given branch and writes them to a directory to be later uploaded
  with `rdme docs upload`.

EXAMPLES
  Export guides from the stable branch into `./guides`:

    $ rdme docs export ./guides

  Export guides from a specific project version:

    $ rdme docs export ./guides --branch=1.0

  Export a specific version, omitting empty guide pages:

    $ rdme docs export ./guides --branch=1.0 --docs-only

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v10#authentication

  --branch=<value>  ReadMe project version

    Defaults to `stable` (i.e., your main project version).
```

## `rdme docs upload PATH`

Upload Markdown files to the Guides section of your ReadMe project.

```
USAGE
  $ rdme docs upload PATH --key <value> [--branch <value>] [--dry-run]

ARGUMENTS
  PATH  Path to a local Markdown file or folder of Markdown files.

FLAGS
  --key=<value>     (required) ReadMe project API key
  --branch=<value>  [default: stable] ReadMe project version
  --dry-run         Runs the command without creating nor updating any guides in ReadMe. Useful for debugging.

DESCRIPTION
  Upload Markdown files to the Guides section of your ReadMe project.

  The path can either be a directory or a single Markdown file.

  The Markdown files will require YAML frontmatter with certain ReadMe documentation attributes. Check out our docs for
  more info on setting up your frontmatter: https://docs.readme.com/main/docs/rdme#markdown-file-setup

EXAMPLES
  The path input can be a directory. This will also upload any Markdown files that are located in subdirectories:

    $ rdme docs upload documentation/ --branch={project-branch}

  The path input can also be individual Markdown files:

    $ rdme docs upload documentation/about.md --branch={project-branch}

  You can omit the `--branch` flag to default to the `stable` branch of your project:

    $ rdme docs upload [path]

  This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about
  dry run mode in our docs: https://docs.readme.com/main/docs/rdme#dry-run-mode

    $ rdme docs upload [path] --dry-run

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v10#authentication

  --branch=<value>  ReadMe project version

    Defaults to `stable` (i.e., your main project version).
```
