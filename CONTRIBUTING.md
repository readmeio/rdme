# Contributing

## Running Shell Commands Locally 🐚

To run test commands from within the repository, run the build and then run your commands from the root of the repository and use `./bin/rdme` instead of `rdme` so it properly points to the command executable, like so:

```sh
npm run build
./bin/rdme openapi:validate __tests__/__fixtures__/ref-oas/petstore.json
```

If you need to debug commands quicker and re-building TS everytime is becoming cumbersome, you can use the debug command, like so:

```sh
npm run debug -- openapi:validate __tests__/__fixtures__/ref-oas/petstore.json
```

## Running GitHub Actions Locally 🐳

To run GitHub Actions locally, we'll be using [`act`](https://github.com/nektos/act) (make sure to read their [prerequisites list](https://github.com/nektos/act#necessary-prerequisites-for-running-act) and have that ready to go before installing `act`)!

Unfortunately (as of this writing), the maintainer hasn't tagged a release that includes [PR #793](https://github.com/nektos/act/issues/793), which is required for running the composite action setup we have defined in [`action.yml`](action.yml). You'll need to install `act` with the `--HEAD` flag:

```sh
brew install act --HEAD
```

As of this writing, this is the version of `act` that is able to successfully run our workflows (i.e. the output of the `act --version` command):

```sh
# https://github.com/nektos/act/commit/9abc87b
act version HEAD-9abc87b
```

Once you've installed `act`, it'll ask you what Docker image size you'd like. The standard Medium ones should do the trick. Here's what your `~/.actrc` file should look like:

```
-P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
-P ubuntu-20.04=ghcr.io/catthehacker/ubuntu:act-20.04
-P ubuntu-18.04=ghcr.io/catthehacker/ubuntu:act-18.04
```

Our GitHub Actions guidance states that Action workflows should have a [`runs-on` value](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idruns-on) of `ubuntu-latest`. These runners are updated frequently — you can find links to the latest versions by navigating [here](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#preinstalled-software) and selecting the latest Ubuntu link. Because of this, you'll want to make sure your `ghcr.io/catthehacker/ubuntu` image stays up-to-date by doing a periodic pull:

```sh
docker pull ghcr.io/catthehacker/ubuntu:act-latest
```

Once it's configured, you can use the `-l` flag to to view all the workflows:

```sh
act -l # all workflows with the default event (i.e. `push`)
act workflow_dispatch -l # all workflows with the `workflow_dispatch` event
```

Running the latter command will return the following:

```
Stage  Job ID  Job name                 Workflow name                 Workflow file  Events
0      simple  GitHub Action Auth-Less  GitHub Action Simple Example  simple.yml     workflow_dispatch
```

And finally, you can use that Job ID to execute a workflow with the `-j` flag (make sure Docker is running!):

```sh
act -j simple
```

## Code Style Guidelines

### Usage of `console`

As you'll learn in our commands logic (see [`bin/rdme`](bin/rdme) and the [`src/cmds`](src/cmds) directory), we wrap our command outputs in resolved/rejected [`Promise` objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and use [`bin/rdme`](bin/rdme) file to log the results to the console and return the correct status code. This is so we can write more resilient tests, ensure that the proper exit codes are being returned, and make debugging easier.

When writing command logic, avoid using `console` statements (and correspondingly, avoid mocking `console` statements in tests) when possible.

<img align="right" width="25%" style="margin-bottom: 2em" src="https://owlbertsio-resized.s3.amazonaws.com/Blocks.psd.png">

### Making `fetch` requests

`fetch` requests are very common in this codebase. When sending `fetch` requests to the ReadMe API (i.e., [dash.readme.com](https://dash.readme.com)), make sure to use the `fetch` wrapper function located in [`src/lib/readmeAPIFetch.ts`](src/lib/readmeAPIFetch.ts). We have an ESLint rule to flag this.

In that wrapper function, we set several important request headers and configure the proxy, if the user added one via `HTTPS_PROXY`.

### Commit Conventions

For our general commit conventions, please consult our organization contributing guidelines [here](https://github.com/readmeio/.github/blob/main/.github/CONTRIBUTING.md#commit-conventions).
