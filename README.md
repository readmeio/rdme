# `rdme` - ReadMe's API CLI

This is a CLI wrapper around [ReadMe's HTTP API](https://readme.readme.io/v2.0/reference).

[![CircleCI](https://circleci.com/gh/readmeio/rdme.svg?style=svg)](https://circleci.com/gh/readmeio/rdme)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

## Installation
```sh
npm install rdme
```

## Usage

### Uploading a new Swagger file to ReadMe

```sh
rdme swagger {path-to-swagger.json} --key={api-key}
```

### Editing an existing Swagger file
```sh
rdme swagger {path-to-swagger.json} --key={api-key} --id={existing-id}
```

### Syncing a folder of markdown docs to ReadMe

```sh
rdme docs path-to-markdown-files --key={api-key} --version={project-version}
```

### Edit a single readme doc on your local machine

```sh
rdme docs:edit <slug> --key={api-key} --version={project-version}
```

## Future
We will be expanding and modifying the feature set of this program as/when we expand our public API. Some things will be changed.
