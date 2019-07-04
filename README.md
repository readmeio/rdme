# `rdme` - ReadMe's CLI

[![CircleCI](https://circleci.com/gh/readmeio/rdme.svg?style=svg)](https://circleci.com/gh/readmeio/rdme)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

### Table of Contents
   * [What is rdme?](#what-is-veneur)
   * [Configuration](#installation)
     * [Installation](#installation)
     * [Login](#logging-in-to-a-readme-project)
   * [Usage](#usage)
      * [Swagger](#swagger)
      * [Docs](#docs)
      * [Versions](#versions)
      * [Opening A Project Spec](#open)
   * [Future](#future)

### About `rdme`
`rdme` is the command line interface wrapper for [ReadMe's RESTful API](https://readme.readme.io/v2.0/reference). It allows you to upload and edit [Swagger](https://swagger.io/) and [OAS](https://swagger.io/specification/) files associated with projects you create on [Readme.io](https://readme.com/). Additionally, you can sync documentation with your project, and manage project versions.

## Installation
```sh
npm install rdme
```

## Usage

### Logging in to a ReadMe project

If you login to a project, you will not have to provide the `--key` option because we save it locally:

```sh
rdme login
```

### Uploading a new Swagger file to ReadMe

```sh
rdme swagger {path-to-swagger.json} --key={api-key}
```

### Editing an existing Swagger file
```sh
rdme swagger {path-to-swagger.json} --key={api-key} --id={existing-id}
```

#### Uploading or editing a swagger file including with specified version
You can additional include a version flag, specifying the target version for your file's destination:
```sh
rdme swagger {path-to-swagger.json} --key={api-key} --version={project-version}
```

#### Omitting the file path
If you run `rdme` within a directory that contains your Swagger or OAS file, you can omit the file path.
Be sure to use one of the following file names: 'swagger.json', 'swagger.yaml', 'openapi.json', 'openapi.yaml'
```sh
rdme swagger --key={api-key}
```

### Syncing a folder of markdown docs to ReadMe

```sh
rdme docs path-to-markdown-files --key={api-key} --version={project-version}
```

### Edit a single readme doc on your local machine

```sh
rdme docs:edit <slug> --key={api-key} --version={project-version}
```

### Get all versions associated with your project
```sh
rdme versions --key={api-key}
```

### Get all information about a particular version
```sh
rdme versions:versionId --key={api-key} --version={project-version}
```

### Create a new version using flags
```sh
rdme versions:create --key={api-key} --version={project-version} --fork={version-fork} --codename={version-name} --main --beta
```

### Create a new version without flags
Creating a version without version-specific flags will allow the ReadMe CLI to prompt you with configuration options
```sh
rdme versions:create --key={api-key} --version={project-version}
```

### Open your ReadMe project in your browser

If you are logged in, this will open the project in your browser:

```sh
rdme open
```

## Future
We will be expanding and modifying the feature set of this program as/when we expand our public API. Some things will be changed.
