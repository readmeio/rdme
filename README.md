# `rdme` - ReadMe's CLI

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

[![CircleCI](https://circleci.com/gh/readmeio/rdme.svg?style=svg)](https://circleci.com/gh/readmeio/rdme)

### Table of Contents
   * [What is rdme?](#about-rdme)
   * [Configuration](#installation)
     * [Installation](#installation)
     * [Login](#logging-in-to-a-readme-project)
   * [Usage](#usage)
      * [Flags](#rdme-flags)
      * [Swagger](#swagger)
      * [Docs](#docs)
      * [Versions](#versions)
      * [Opening A Project Spec](#open)
   * [Future](#future)

### About `rdme`
`rdme` is the CLI wrapper for [ReadMe's RESTful API](https://readme.readme.io/v2.0/reference). It allows you to upload and edit [Swagger](https://swagger.io/) and [OAS](https://swagger.io/specification/) files associated with projects you create on [readme](https://readme.com/). Additionally, you can sync documentation with your project, and manage project versions.

## Configuration
### Installation
```sh
npm install rdme
```
### Logging in to a ReadMe project

If you login to a project, you will not have to provide the `--key` option because we save it locally:

```sh
rdme login
```

## Usage
### `rdme` flags
```
swaggerfile.json || oasfile.yaml
--key              # API key associated with your ReadMe project
--version          # The version
--id               # The id of a OAS file previously uploaded. This is available through uploading a new file through this CLI
--fork             # The semantic version which you'd like to fork from
--codename         # The codename or nickname for a particular version
--main             # Should this version be the primary (default) version for your project?
--beta             # Is this version in beta?
--isPublic         # Would you like to make this version public? Any primary version must be public
```

### Swagger
#### Uploading a new Swagger file to ReadMe
This will return an id and url for you to update your file and view it in the client, respectively
```sh
rdme swagger {path-to-swagger.json} --key={api-key}
```

#### Editing an existing Swagger file
```sh
rdme swagger {path-to-swagger.json} --key={api-key} --id={existing-id}
```

#### Uploading or editing a swagger file including with specified version
You can additional include a version flag, specifying the target version for your file's destination
```sh
rdme swagger {path-to-swagger.json} --key={api-key} --version={project-version}
```

#### Omitting the file path
If you run `rdme` within a directory that contains your Swagger or OAS file, you can omit the file path.
Be sure to use one of the following file names: `swagger.json`, `swagger.yaml`, `openapi.json`, `openapi.yaml` if you do.
```sh
rdme swagger --key={api-key}
```

### Docs
#### Syncing a folder of markdown docs to ReadMe

```sh
rdme docs path-to-markdown-files --key={api-key} --version={project-version}
```

#### Edit a single readme doc on your local machine

```sh
rdme docs:edit <slug> --key={api-key} --version={project-version}
```

### Versions
#### Get all versions associated with your project
```sh
rdme versions --key={api-key}
```

#### Get all information about a particular version
```sh
rdme versions --key={api-key} --version={project-version}
```

#### Create a new version using flags
```sh
rdme versions:create --key={api-key} --version={project-version} --fork={version-fork} --codename={version-name} --main --beta
```

#### Create a new version without flags
Creating a version without version-specific flags will allow the ReadMe CLI to prompt you with configuration options
```sh
rdme versions:create --key={api-key} --version={project-version}
```

#### Update a version
The command to update a version takes the same flags as creating a new version
```sh
rdme versions:update --key={api-key} --version={project-version}
```

#### Delete a version
You can remove a specific version from your project, as well as all of the attached specs
```sh
rdme versions:delete --key={api-key} --version={project-version}
```

### Open your ReadMe project in your browser
If you are logged in, this will open the project in your browser:

```sh
rdme open
```

## Future
We are continually expanding and improving the offerings of this application as we expand our public API and are able. Some interactions may change over time.
