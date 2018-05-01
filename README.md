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
rdme swagger {path-to-swagger.json} --token={api-key}
```

### Editing an existing Swagger file
```sh
rdme swagger {path-to-swagger.json} --token={api-key}-{existing-id}
```

## Future
We will be expanding and modifying the feature set of this program as/when we expand our public API. Some things will be changed.
