# Contributing

## Running Shell Commands Locally 🐚

To run test commands, swap out `rdme` for `bin/dev.js`. For example:

```sh
# if the production command you're testing looks like this...
rdme openapi validate __tests__/__fixtures__/ref-oas/petstore.json

# ... your local test command will look like this:
bin/dev.js openapi validate __tests__/__fixtures__/ref-oas/petstore.json
```

The `bin/dev.js` file has a few features that are useful for local development:

- It reads directly from your TypeScript files (so no need to re-run the TypeScript compiler every time you make a change)
- It returns error messages with full stack traces

`bin/dev.js` is convenient for useful for rapid development but it's not a 1:1 recreation of what the end-user experience with `rdme` is like. To recreate the production `rdme` experience, use the `bin/run.js` file instead. You'll need to re-run the TypeScript compiler (i.e., `npm run build`) every time you make a change. So for example:

```sh
npm run build
bin/run.js openapi validate __tests__/__fixtures__/ref-oas/petstore.json
```

Your changes to the command code may make changes to [the command reference documents](./documentation/commands) — it is up to you whether you include those changes in your PR or if you let the release process take care of it. More information on that can be found in [`MAINTAINERS.md`](./MAINTAINERS.md).

## ReadMe Development 🦉

If you're a ReadMe team member that's testing `rdme` against a non-production ReadMe environment, you can either set the `RDME_LOCALHOST=true` environment variable (which points your CLI to the localhost version of ReadMe) or modify the URLs in `src/lib/config.ts` directly.

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

<details>

<summary>⚠️ <b>Outdated guidance</b> (you'll notice we still use this paradigm in a few commands, but don't use this guidance for new commands!)</summary>

As you'll learn in our commands logic (see [`bin/run.js`](bin/run.js) and the [`src/commands`](src/commands) directory), we wrap our command outputs in resolved/rejected [`Promise` objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and use [`bin/run.js`](bin/run.js) file to log the results to the console and return the correct status code. This is so we can write more resilient tests, ensure that the proper exit codes are being returned, and make debugging easier.

When writing command logic, avoid using `console` statements (and correspondingly, avoid mocking `console` statements in tests) when possible.

</details>

<details open>

<summary><b>Updated Guidance</b></summary>

When writing command logic, avoid using `console` statements. As modeled by [the `openapi upload` command](https://github.com/readmeio/rdme/blob/1e199064b0418b11b56ce08bad3d96ff2bead10c/src/commands/openapi/upload.ts) (only available in `v10` and above), we use [`oclif`'s command methods](https://oclif.io/docs/commands/#command-methods) for writing to the console. This allows us to seamlessly integrate [`oclif`'s support for JSON output](https://oclif.io/docs/json/).

[The `@oclif/test` helper](https://github.com/oclif/test) automatically mocks any writes to `stdout` or `stderr`. This is great for properly asserting `rdme` outputs, but can be a bit confusing to develop with at first if you rely on `console.log` as part of your debugging since those statements won't get written to the console the way you'd expect.

If you rely on `console.log` (or something similar) during development, you can do the following to view your output:

1. Make sure you're using the `runCommand` helper in [this file](https://github.com/readmeio/rdme/blob/1e199064b0418b11b56ce08bad3d96ff2bead10c/__tests__/helpers/oclif.ts) and **not** `runCommandAndReturnResult`. See [this test file](https://github.com/readmeio/rdme/blob/1e199064b0418b11b56ce08bad3d96ff2bead10c/__tests__/commands/openapi/upload.test.ts) for an example.

2. Add a statement like this in your test:

   ```js
   const result = await run(['--key', key]); // add any other flags here as needed
   expect(result).toStrictEqual({}); // this will fail, but it will output the entire result object, which you can inspect
   ```

</details>

<img align="right" width="25%" style="margin-bottom: 2em" src="https://owlbertsio-resized.s3.amazonaws.com/Blocks.psd.png">

### Making `fetch` requests

`fetch` requests are very common in this codebase. When sending `fetch` requests to the ReadMe API (i.e., [dash.readme.com](https://dash.readme.com) or [api.readme.com](https://api.readme.com)), make sure to use the `fetch` wrapper function located in [`src/lib/readmeAPIFetch.ts`](src/lib/readmeAPIFetch.ts).

In that wrapper function, we set several important request headers and configure the proxy, if the user added one via `HTTPS_PROXY`.

### Commit Conventions

For our general commit conventions, please consult our organization contributing guidelines [here](https://github.com/readmeio/.github/blob/main/.github/CONTRIBUTING.md#commit-conventions).
