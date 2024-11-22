`rdme categories`
=================

List or create categories in your ReadMe developer hub.

* [`rdme categories`](#rdme-categories)
* [`rdme categories:create TITLE`](#rdme-categoriescreate-title)

## `rdme categories`

Get all categories in your ReadMe project.

```
USAGE
  $ rdme categories --key <value> [--version <value>]

FLAGS
  --key=<value>      (required) ReadMe Project API key
  --version=<value>  Project version. If running command in a CI environment and this option is not passed, the main
                     project version will be used.

DESCRIPTION
  Get all categories in your ReadMe project.

EXAMPLES
  Get all categories associated to your project version:

    $ rdme categories --version={project-version}
```

## `rdme categories:create TITLE`

Create a category with the specified title and guide in your ReadMe project.

```
USAGE
  $ rdme categories:create TITLE --categoryType guide|reference --key <value> [--preventDuplicates] [--version <value>]

ARGUMENTS
  TITLE  Title of the category

FLAGS
  --categoryType=<option>  (required) Category type
                           <options: guide|reference>
  --key=<value>            (required) ReadMe Project API key
  --preventDuplicates      Prevents the creation of a new category if there is an existing category with a matching
                           `categoryType` and `title`
  --version=<value>        Project version. If running command in a CI environment and this option is not passed, the
                           main project version will be used.

DESCRIPTION
  Create a category with the specified title and guide in your ReadMe project.

EXAMPLES
  Create a new category for your project version:

    $ rdme categories:create <title> --categoryType={guide|reference} --version={project-version}

  If you want to prevent the creation of a duplicate category with a matching `title` and `categoryType`, supply the
  `--preventDuplicates` flag:

    $ rdme categories:create <title> --categoryType={guide|reference} --version={project-version} \
      --preventDuplicates
```
