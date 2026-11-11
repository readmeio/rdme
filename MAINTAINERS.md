# Maintainers

Releases publish to GitHub and npm from `main`. The `v9` branch is only for the 9.x maintenance line. There is no prerelease branch and no `next` dist-tag.

## Opening a release

Merging a pull request does not publish. A change ships only when someone merges the **Version Packages** pull request.

1. The pull request that should ship includes a changeset (`npx changeset`). The file records the bump (`patch`, `minor`, or `major`) and the changelog sentence.
2. After that pull request merges to `main`, the release workflow updates one open pull request titled `build(release): version packages`. That pull request bumps `package.json`, writes `CHANGELOG.md`, rebuilds `dist-gha` and the command docs, and deletes the consumed changeset files. New changelog entries are inserted above the first heading that starts with a version (`## 10.10.2`). Keep that shape. A heading like `## [10.10.2](...)` is ignored, and the entry would be written further down the file.
3. Merge the Version Packages pull request when the release should go out. The workflow then runs `npm publish` on the `latest` dist-tag through npm trusted publishing, pushes the `vX.Y.Z` tag, and opens the GitHub release.
4. The same workflow also pushes the unprefixed tag (`10.10.2` as well as `v10.10.2`) and moves the floating `v10` tag. GitHub Action users should pin `readmeio/rdme@v10`.

Dependency updates and other pull requests that should not release omit the changeset. `npx changeset --empty` records that the omission was intentional.

The workflow file must stay `.github/workflows/release.yml`. Trusted publishing is bound to that filename. The publish job is the only job with `id-token: write`. It must not set `NPM_TOKEN`, `NODE_AUTH_TOKEN`, or `registry-url` on `actions/setup-node`, and it must not use a GitHub Environment. Provenance is attached automatically.

`@changesets/cli` requires Node 22.11 or newer. The publish job installs npm 11 because trusted publishing requires npm 11.5.1 or newer. The package itself still supports Node 20.

After a publish, confirm the version was published by GitHub Actions:

```sh
npm view rdme@<version> --json
```

`_npmUser.name` should be `GitHub Actions`, and `dist.attestations` should be present. The post-release job retries `npm install -g rdme@<version>` until the registry is serving it.

You can still edit the GitHub release notes after they are created.

## 9.x

Fixes that do not call the ReadMe API can be released to the 9.x line.

1. Cherry-pick the commit from `main` onto a branch based on `v9`.
2. Add a changeset. Use `patch` or `minor` only. A major bump fails the publish job.
3. Open the pull request against `v9`.
4. Merge the Version Packages pull request that the workflow opens against `v9`.

That publish uses `npm publish --tag release-v9`. Publishing 9.x without that tag would move `latest` backwards. `v9` is a branch name, so the floating major tag is not moved for these releases.

## After this cutover

These steps are repository settings, not code:

1. Make `main` the default branch.
2. Retarget open pull requests that still point at `next`.
3. Delete the `next` branch. `uses: readmeio/rdme@next` is a git ref and stops resolving when the branch is gone.
4. After the first stable publish from this workflow, remove the leftover npm dist-tag with `npm dist-tag rm rdme next`. That needs **Allow npm dist-tag** on the trusted publisher. Tell anyone still installing `rdme@next` to install `rdme` with no tag.
5. When a published version shows a trusted publisher, delete the `NPM_TOKEN` secret and set the package's publishing access to require two-factor authentication and disallow tokens.
