`rdme versions`
===============

Manage your documentation versions.

* [`rdme versions`](#rdme-versions)
* [`rdme versions:create VERSION`](#rdme-versionscreate-version)
* [`rdme versions:delete [VERSION]`](#rdme-versionsdelete-version)
* [`rdme versions:update [VERSION]`](#rdme-versionsupdate-version)

## `rdme versions`

List versions available in your project or get a version by SemVer (https://semver.org/).

```
USAGE
  $ rdme versions --key <value> [--version <value>]

FLAGS
  --key=<value>      (required) ReadMe Project API key
  --version=<value>  A specific project version to view.

DESCRIPTION
  List versions available in your project or get a version by SemVer (https://semver.org/).
```

## `rdme versions:create VERSION`

Create a new version for your project.

```
USAGE
  $ rdme versions:create VERSION --key <value> [--fork <value>] [--codename <value>] [--main true|false] [--beta
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
  --key=<value>          (required) ReadMe Project API key
  --main=<option>        Should this be the main version for your project?
                         <options: true|false>

DESCRIPTION
  Create a new version for your project.
```

## `rdme versions:delete [VERSION]`

Delete a version associated with your ReadMe project.

```
USAGE
  $ rdme versions:delete [VERSION] --key <value>

ARGUMENTS
  VERSION  The version you'd like to delete.

FLAGS
  --key=<value>  (required) ReadMe Project API key

DESCRIPTION
  Delete a version associated with your ReadMe project.
```

## `rdme versions:update [VERSION]`

Update an existing version for your project.

```
USAGE
  $ rdme versions:update [VERSION] --key <value> [--newVersion <value>] [--codename <value>] [--main true|false]
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
  --key=<value>          (required) ReadMe Project API key
  --main=<option>        Should this be the main version for your project?
                         <options: true|false>
  --newVersion=<value>   What should the version be renamed to?

DESCRIPTION
  Update an existing version for your project.
```
