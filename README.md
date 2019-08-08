# `rdme` - ReadMe's CLI

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.com)

[![npm](https://img.shields.io/npm/v/rdme)](https://npm.im/rdme) [![CircleCI](https://circleci.com/gh/readmeio/rdme.svg?style=svg)](https://circleci.com/gh/readmeio/rdme)

### Table of Contents
   * [What is rdme?](#about-rdme)
   * [Configuration](#installation)
     * [Installation](#installation)
     * [Authentication](#authentication)
   * [Usage](#usage)
      * [Common options](#common-rdme-options)
      * [Swagger / OpenAPI](#swagger-/-openapi)
      * [Docs](#docs)
      * [Versions](#versions)
      * [Opening a Project](#open)
   * [Future](#future)

### About `rdme`
`rdme` is the CLI wrapper for [ReadMe's RESTful API](https://readme.readme.io/v2.0/reference). It allows you to upload and edit [Swagger](https://swagger.io/) and [OAS](https://swagger.io/specification/) files associated with projects you create on [ReadMe](https://readme.com/). Additionally, you can sync documentation with your project, and manage project versions.

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

### Common `rdme` options
* `--key <string>`: The API key associated with your ReadMe project. You can obtain this from your dashboard, or alternatively if you log in with `rdme login`, we will save your API key to a local configuration file (`~/.config/configstore/rdme-production.json`), saving you the hassle of having to supply this argument on commands that have it.
* `--version <string>`: Your project version.

### Swagger / OpenAPI
ReadMe supports both [Swagger 2.0](https://swagger.io/docs/specification/2-0/basic-structure/) and [OpenAPI 3.0](https://swagger.io/docs/specification/about/).

#### Uploading a new API description to ReadMe
This will upload `path-to-swagger.json` to your project and return an ID and URL for you to later update your file, and view it in the client.

```sh
rdme swagger [path-to-file.json]
```

#### Editing (resync) an existing API description
This will edit (resync) an existing API description (identified by `--id`) within your ReadMe project.

```sh
rdme swagger [path-to-file.json] --id={existing-id}
```

#### Uploading or editing an API description in a project version
You can additional include a version flag, specifying the target version for your file's destination

```sh
rdme swagger [path-to-file.json] --version={project-version}
```

```sh
rdme swagger [path-to-file.json] --id={existing-id} --version={project-version}
```

#### Omitting the file path
If you run `rdme` within a directory that contains your Swagger or OAS file, you can omit the file path. We will then look for a file with the following names, and upload that: `swagger.json`, `swagger.yaml`, `openapi.json`, and `openapi.yaml`

```sh
rdme swagger
```

### Docs
#### Syncing a folder of Markdown docs to ReadMe
```sh
rdme docs path-to-markdown-files --version={project-version}
```

#### Edit a single ReadMe doc on your local machine
```sh
rdme docs:edit <slug> --version={project-version}
```

### Versions
#### Get all versions associated with your project
```sh
rdme versions
```

If you wish to see the raw output from our API in this response, supply  the `--raw` flag.

#### Get all information about a particular version
```sh
rdme versions --version={project-version}
```

If you wish to see the raw output from our API in this response, supply  the `--raw` flag.

#### Create a new version
```sh
rdme versions:create <version> | --version={project-version}
```

##### Automating this process
If you wish to automate the process of creating a new project version, and not have the CLI prompt you for input, you can do so by supplying the necessary flags to `versions:create`.

For example:

```sh
rdme versions:create <version> | --version={project-version} --fork={version-fork} --main={boolean} --beta={boolean} --isPublic={boolean}
```

See `rdme versions:create --help` for a full list of flags.

#### Update a version
```sh
rdme versions:update --version={project-version}
```

Like `versions:create`, if you wish to automate this process and not be blocked by CLI input, you can supply the necessary flags to this command. See `rdme versions:update --help` or [automating this process](#automating-this-process) for more information.

#### Delete a version
You can remove a specific version from your project, as well as all of the attached specs

```sh
rdme versions:delete --version={project-version}
```

### Open your ReadMe project in your browser
If you are logged in, this will open the project in your browser:

```sh
rdme open
```

## Future
We are continually expanding and improving the offerings of this application as we expand our public API and are able. Some interactions may change over time, but we will do our best to retain backwards compatibility.
