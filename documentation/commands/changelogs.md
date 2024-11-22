`rdme changelogs`
=================

Sync Markdown files to your ReadMe project as Changelog posts.

* [`rdme changelogs PATH`](#rdme-changelogs-path)

## `rdme changelogs PATH`

Sync Markdown files to your ReadMe project as Changelog posts.

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
  Sync Markdown files to your ReadMe project as Changelog posts.

  Syncs Markdown files to the Changelog section of your ReadMe project. The path can either be a directory or a single
  Markdown file. The Markdown files will require YAML front matter with certain ReadMe documentation attributes. Check
  out our docs for more info on setting up your front matter: https://docs.readme.com/main/docs/rdme#markdown-file-setup

EXAMPLES
  Passing in a path to a directory will also sync any Markdown files that are located in subdirectories. The path
  input can also be individual Markdown files:

    $ rdme changelogs [path] --version={project-version}

  This command also has a dry run mode, which can be useful for initial setup and debugging. You can read more about
  dry run mode in our docs: https://docs.readme.com/main/docs/rdme#dry-run-mode

    $ rdme changelogs [path] --version={project-version} --dryRun
```
