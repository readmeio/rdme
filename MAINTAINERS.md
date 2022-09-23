# Maintainers

This doc describes how to prep a release and publish to GitHub and `npm`.

## Prep the Release

Run the following command, where `<version>` is the version you wish to update the package to:

```sh
npm run bump -- <version>
```

This command will automatically bump the version in the `package.json` and the `package-lock.json` files, as well as add the corresponding tags.

## Publishing to GitHub :octopus:

The next step is to push these changes to GitHub:

```sh
git push --follow-tags
```

## Publishing to `npm` :rocket:

Finally, publish the changes to `npm`. If you're publishing to the default [distribution tag](https://docs.npmjs.com/adding-dist-tags-to-packages) (i.e. `latest`), you can run the following:

```sh
npm publish
```

If you're publishing to another [distribution tag](https://docs.npmjs.com/adding-dist-tags-to-packages) for prelease purposes or otherwise (e.g., `alpha`, `beta`, `next`, etc.), include the tag like so:

```sh
npm publish --tag <tag>
```
