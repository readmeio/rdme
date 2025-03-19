`rdme docs`
===========

Sync or prune Guides pages in your ReadMe developer hub.

* [`rdme docs PATH`](#rdme-docs-path)
* [`rdme docs prune FOLDER`](#rdme-docs-prune-folder)

## `rdme docs PATH`

Sync Markdown files to your ReadMe project as Guides.

```
USAGE
  $ rdme docs PATH --key <value> [--version <value>] [--github] [--dryRun]

ARGUMENTS
  PATH  Path to a local Markdown file or folder of Markdown files.

FLAGS
  --dryRun           Runs the command without creating/updating any docs in ReadMe. Useful for debugging.
  --github           Create a new GitHub Actions workflow for this command.
  --key=<value>      (required) ReadMe project API key
  --version=<value>  ReadMe project version

DESCRIPTION
  Sync Markdown files to your ReadMe project as Guides.

  Syncs Markdown files to the Guides section of your ReadMe project. The path can either be a directory or a single
  Markdown file. The Markdown files will require YAML frontmatter with certain ReadMe documentation attributes. Check
  out our docs for more info on setting up your frontmatter: https://docs.readme.com/main/docs/rdme#markdown-file-setup

ALIASES
  $ rdme guides

EXAMPLES
  Passing in a path to a directory will also sync any Markdown files that are located in subdirectories. The path
  input can also be individual Markdown files:

    $ rdme docs [path] --version={project-version}

  This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about
  dry run mode in our docs: https://docs.readme.com/main/docs/rdme#dry-run-mode

    $ rdme docs [path] --version={project-version} --dryRun

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v9#authentication

  --version=<value>  ReadMe project version

    If running command in a CI environment and this option is not passed, the main project version will be used. See our
    docs for more information: https://docs.readme.com/main/docs/versions
```

## `rdme docs prune FOLDER`

Delete any docs from ReadMe if their slugs are not found in the target folder.

```
USAGE
  $ rdme docs prune FOLDER --key <value> [--version <value>] [--github] [--confirm] [--dryRun]

ARGUMENTS
  FOLDER  A local folder containing the files you wish to prune.

FLAGS
  --confirm          Bypass the confirmation prompt. Useful for CI environments.
  --dryRun           Runs the command without deleting any docs in ReadMe. Useful for debugging.
  --github           Create a new GitHub Actions workflow for this command.
  --key=<value>      (required) ReadMe project API key
  --version=<value>  ReadMe project version

DESCRIPTION
  Delete any docs from ReadMe if their slugs are not found in the target folder.

ALIASES
  $ rdme guides prune

EXAMPLES
  If you wish to delete documents from ReadMe that are no longer present in your local directory:

    $ rdme docs prune [path-to-directory-of-markdown]

  Run with `--confirm` to bypass the confirmation prompt (useful for CI environments):

    $ rdme docs prune [path-to-directory-of-markdown] --confirm

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v9#authentication

  --version=<value>  ReadMe project version

    If running command in a CI environment and this option is not passed, the main project version will be used. See our
    docs for more information: https://docs.readme.com/main/docs/versions
```
