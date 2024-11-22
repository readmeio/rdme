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
```
