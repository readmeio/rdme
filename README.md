# 📖 rdme

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.com)

[![npm](https://img.shields.io/npm/v/rdme)](https://npm.im/rdme) [![Build](https://github.com/readmeio/rdme/workflows/CI/badge.svg)](https://github.com/readmeio/rdme)

`rdme` is the CLI wrapper for [ReadMe's RESTful API](https://docs.readme.com/reference/intro-to-the-readme-api). It allows you to upload and edit [OpenAPI](https://swagger.io/specification/) and [Swagger](https://swagger.io/specification/v2/) files associated with projects you create on [ReadMe](https://readme.com/). Additionally, you can sync documentation with your project, and manage project versions.

* [Configuration](#installation)
   * [Installation](#installation)
   * [Authentication](#authentication)
* [Usage](#usage)
   * [Common options](#common-rdme-options)
   * [OpenAPI / Swagger](#openapi--swagger)
   * [Docs](#docs)
   * [Versions](#versions)
   * [Opening a Project](#open)
* [Future](#future)

## Configuration
### Installation
```sh
npm install rdme
```

### Authentication
If you authenticate `rdme` to your ReadMe project, we will save your API key to a local configuration file (`~/.config/configstore/rdme-production.json`) so you will not have to provide the `--key` option to commands that require it.

```sh
rdme login
```

`rdme whoami` is also available to you to determine who you are logged in as, and to what project, as well as `rdme logout` for logging out of that account.

## Usage
If you wish to get more information about any command within `rdme`, you can execute `rdme help <command>` or `rdme <command> --help`. You an also execute `rdme help` to see a global list of commands that `rdme` offers.

### Common `rdme` Options
* `--key <string>`: The API key associated with your ReadMe project. You can obtain this from your dashboard, or alternatively if you log in with `rdme login`, we will save your API key to a local configuration file (`~/.config/configstore/rdme-production.json`), saving you the hassle of having to supply this argument on commands that have it.
* `--version <string>`: Your project version.

### OpenAPI / Swagger
ReadMe supports [OpenAPI 3.0](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md), [OpenAPI 3.1](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md), and [Swagger 2.x](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md).

> ℹ️ Note that the `rdme openapi` command supports both OpenAPI and Swagger API definitions. The `rdme swagger` command is an alias for `rdme openapi` and is deprecated.

#### Uploading a New API Definition to ReadMe
This will upload `path-to-openapi.json` to your project and return an ID and URL for you to later update your file, and view it in the client.

```sh
rdme openapi [path-to-file.json]
```

#### Editing (Re-Syncing) an Existing API Definition
This will edit (re-sync) an existing API definition (identified by `--id`) within your ReadMe project.

```sh
rdme openapi [path-to-file.json] --id={existing-id}
```

#### Uploading or Editing an API Definition in a Project Version
You can additional include a version flag, specifying the target version for your file's destination

```sh
rdme openapi [path-to-file.json] --version={project-version}
```

```sh
rdme openapi [path-to-file.json] --id={existing-id} --version={project-version}
```

#### Validating an API Definition
You can also perform a local validation of your API definition without uploading it to ReadMe, which can be useful when constructing or editing your API definition.

```sh
rdme validate [path-to-file.json]
```

#### Omitting the File Path
If you run `rdme` within a directory that contains your OpenAPI or Swagger definition, you can omit the file path. We will then look for a file with the following names, and upload that: `openapi.json`, `openapi.yaml`, `swagger.json`, and `swagger.yaml`.

```sh
rdme openapi
```

### Docs
#### Syncing a Folder of Markdown Docs to ReadMe
```sh
rdme docs path-to-markdown-files --version={project-version}
```

#### Edit a Single ReadMe Doc on Your Local Machine
```sh
rdme docs:edit <slug> --version={project-version}
```

### Versions
#### Get All Versions Associated With Your Project
```sh
rdme versions
```

If you wish to see the raw JSON output from our API in this response, supply  the `--raw` flag.

#### Get All Information About a Particular Version
```sh
rdme versions --version={project-version}
```

If you wish to see the raw JSON output from our API in this response, supply  the `--raw` flag.

#### Create a New Version
```sh
rdme versions:create <version> | --version={project-version}
```

##### Create a New Version
If you wish to automate the process of creating a new project version, and not have the CLI prompt you for input, you can do so by supplying the necessary flags to `versions:create`.

For example:

```sh
rdme versions:create <version> | --version={project-version} --fork={version-fork} --main={boolean} --beta={boolean} --isPublic={boolean}
```

See `rdme versions:create --help` for a full list of flags.

#### Update a Version
```sh
rdme versions:update --version={project-version}
```

Like `versions:create`, if you wish to automate this process and not be blocked by CLI input, you can supply the necessary flags to this command. See `rdme versions:update --help` for more information.

#### Delete a Version
You can remove a specific version from your project, as well as all of the attached specs

```sh
rdme versions:delete --version={project-version}
```

### Open Your ReadMe Project in Your Browser
If you are logged in, this will open the project in your browser:

```sh
rdme open
```

## Future
We are continually expanding and improving the offerings of this application as we expand our public API and are able. Some interactions may change over time, but we will do our best to retain backwards compatibility.
