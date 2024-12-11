`rdme versions`
===============

Manage your documentation versions.

* [`rdme versions`](#rdme-versions)
* [`rdme versions create VERSION`](#rdme-versions-create-version)
* [`rdme versions delete [VERSION]`](#rdme-versions-delete-version)
* [`rdme versions update [VERSION]`](#rdme-versions-update-version)

## `rdme versions`

List versions available in your project or get a version by SemVer (https://semver.org/).

```
USAGE
  $ rdme versions --key <value> [--version <value>]

FLAGS
  --key=<value>      (required) ReadMe project API key
  --version=<value>  A specific project version to view.

DESCRIPTION
  List versions available in your project or get a version by SemVer (https://semver.org/).

EXAMPLES
  Get all versions associated with your project:

    $ rdme versions

  Get all information about a particular version:

    $ rdme versions --version={project-version}

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v9#authentication
```

## `rdme versions create VERSION`

Create a new version for your project.

```
USAGE
  $ rdme versions create VERSION --key <value> [--fork <value>] [--codename <value>] [--main true|false] [--beta
    true|false] [--deprecated true|false] [--hidden true|false]

ARGUMENTS
  VERSION  The version you'd like to create. Must be valid SemVer (https://semver.org/)

FLAGS
  --beta=<option>        Should this version be in beta?
                         <options: true|false>
  --codename=<value>     The codename, or nickname, for a particular version.
  --deprecated=<option>  Should this version be deprecated? The main version cannot be deprecated.
                         <options: true|false>
  --fork=<value>         The semantic version which you'd like to fork from.
  --hidden=<option>      Should this version be hidden? The main version cannot be hidden.
                         <options: true|false>
  --key=<value>          (required) ReadMe project API key
  --main=<option>        Should this be the main version for your project?
                         <options: true|false>

DESCRIPTION
  Create a new version for your project.

EXAMPLES
  Create a new version (with no flags):

    $ rdme versions create

  If you wish to automate the process of creating a new project version, and not have the CLI prompt you for input,
  you can do so by supplying the necessary flags:

    $ rdme versions create <version> --fork={version-fork} --main={true|false} --beta={true|false} \
      --deprecated={true|false} --hidden={true|false}

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v9#authentication
```

## `rdme versions delete [VERSION]`

Delete a version associated with your ReadMe project.

```
USAGE
  $ rdme versions delete [VERSION] --key <value>

ARGUMENTS
  VERSION  The version you'd like to delete.

FLAGS
  --key=<value>  (required) ReadMe project API key

DESCRIPTION
  Delete a version associated with your ReadMe project.

EXAMPLES
  Remove a specific version from your project, as well as all of the associated documentation:

    $ rdme versions delete <version>

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v9#authentication
```

## `rdme versions update [VERSION]`

Update an existing version for your project.

```
USAGE
  $ rdme versions update [VERSION] --key <value> [--newVersion <value>] [--codename <value>] [--main true|false]
    [--beta true|false] [--deprecated true|false] [--hidden true|false]

ARGUMENTS
  VERSION  The existing version you'd like to update.

FLAGS
  --beta=<option>        Should this version be in beta?
                         <options: true|false>
  --codename=<value>     The codename, or nickname, for a particular version.
  --deprecated=<option>  Should this version be deprecated? The main version cannot be deprecated.
                         <options: true|false>
  --hidden=<option>      Should this version be hidden? The main version cannot be hidden.
                         <options: true|false>
  --key=<value>          (required) ReadMe project API key
  --main=<option>        Should this be the main version for your project?
                         <options: true|false>
  --newVersion=<value>   What should the version be renamed to?

DESCRIPTION
  Update an existing version for your project.

EXAMPLES
  Update an existing version (with no flags):

    $ rdme versions update

  If you wish to automate the process of updating a project version, and not have the CLI prompt you for input, you
  can do so by supplying the necessary flags:

    $ rdme versions update <version> --newVersion={new-version-name} --main={true|false} --beta={true|false} \
      --deprecated={true|false} --hidden={true|false}

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v9#authentication
```
