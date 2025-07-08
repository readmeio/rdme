`rdme custompages`
==================

Sync Markdown/HTML files to your ReadMe project as Custom Pages.

* [`rdme custompages PATH`](#rdme-custompages-path)

## `rdme custompages PATH`

Sync Markdown/HTML files to your ReadMe project as Custom Pages.

```
USAGE
  $ rdme custompages PATH --key <value> [--github] [--dryRun]

ARGUMENTS
  PATH  Path to a local Markdown file or folder of Markdown files.

FLAGS
  --dryRun       Runs the command without creating/updating any custom pages in ReadMe. Useful for debugging.
  --github       Create a new GitHub Actions workflow for this command.
  --key=<value>  (required) ReadMe project API key

DESCRIPTION
  Sync Markdown/HTML files to your ReadMe project as Custom Pages.

  Syncs Markdown files as Custom Pages in your ReadMe project. The path can either be a directory or a single Markdown
  file. The Markdown files will require YAML frontmatter with certain ReadMe documentation attributes. Check out our
  docs for more info on setting up your frontmatter: https://docs.readme.com/main/docs/rdme-legacy#markdown-file-setup

EXAMPLES
  Passing in a path to a directory will also sync any Markdown files that are located in subdirectories. The path
  input can also be individual Markdown files:

    $ rdme custompages [path] --version={project-version}

  This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about
  dry run mode in our docs: https://docs.readme.com/main/docs/rdme#dry-run-mode

    $ rdme custompages [path] --version={project-version} --dryRun

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v9#authentication
```
