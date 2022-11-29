# Maintainers

This doc describes how to prep a release and publish to GitHub and `npm`.

## Prep the Release

Run the following command, where `<version>` is the version you wish to update the package to:

```sh
npm run bump -- <version>
```

This command will automatically bump the version in the `package.json` and the `package-lock.json` files, update [`CHANGELOG.md`](./CHANGELOG.md), and add the corresponding git tags.

## Publishing to GitHub :octopus:

The next step is to push these changes to GitHub:

```sh
git push # pushes the code
git push --tags -f # pushes the tags
```

Once the code and tags are pushed to GitHub, [create a new release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release) so the latest tag is surfaced in [the GitHub Marketplace listing](https://github.com/marketplace/actions/rdme-sync-to-readme).

> **Note**
> When selecting the tag to associate the release with, use the one **without** the `v` prefix (e.g., `8.0.0`, not `v8.0.0`).

Auto-generating release notes is sufficient, but I like to summarize the changes and note any highlights in a blurb above those notes. These release links are nice for sharing with customers, on socials, etc.

## Publishing to `npm` :rocket:

Finally, publish the changes to `npm`. If you're publishing to a non-standard [distribution tag](https://docs.npmjs.com/adding-dist-tags-to-packages) for prelease purposes or otherwise (e.g., `alpha`, `beta`, `next`, etc.), you can run the following:

```sh
npm publish --tag <tag>
```

If you're publishing to the default [distribution tag](https://docs.npmjs.com/adding-dist-tags-to-packages) (i.e., `latest`), you can omit the `--tag` flag like so:

```sh
npm publish
```
