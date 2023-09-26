# Maintainers

This doc describes how releases are published to GitHub and `npm`.

## Automatic Packaging + Publishing 📦

Nearly all of our release process is automated. In this section, we discuss everything that takes place!

> [!NOTE]
> You don't _need_ to know everything that takes place here, this is mostly for my own documentation purposes! But if you are tagging an actual release, there are a couple of outstanding steps that are described in [the next section](#one-more-thing-☝️) 👇

When code is merged into the `main` or `next` branches, a release workflow (powered by [`semantic-release`](https://github.com/semantic-release/semantic-release)) automatically kicks off that does the following:

- All commit messages since the last release are analyzed to determine whether or not the new changes warrant a new release (i.e., if the changes are features or fixes as opposed to smaller housekeeping changes) 🧐
- Based on the changes, the version is bumped in [`package.json`](./package.json) and the [`action.yml`](./action.yml) with a new git tag 🏷️ For example, say the current version is `8.5.1` and the commit history includes a new feature. This would result in a minor semver bump, which would produce the following tags:
  - A release tag like `v8.6.0` if on the `main` branch
  - A prerelease tag like `v8.6.0-next.1` if on the `next` branch
- A changelog is generated and appended to [`CHANGELOG.md`](./CHANGELOG.md) 🪵
- A build commit (like [this](https://github.com/readmeio/rdme/commit/533a2db50b39c3b6130b3af07bebaed38218db4c)) is created with the updated `package*.json` and `CHANGELOG.md` files 🆕
- A new Docker image is built with the latest code and release metadata and pushed to [the GitHub Container Registry](https://github.com/readmeio/rdme/pkgs/container/rdme) 🐳
- A couple duplicated tags are created for the current commit so our users can refer to them differently in their GitHub Actions (e.g., `8.6.0`, `v8`) 🔖
- The new commit and tags are pushed to GitHub 📌
- The new version is published to the `npm` registry 🚀 The package [distribution tag](https://docs.npmjs.com/adding-dist-tags-to-packages) will depend on which branch is being pushed to:
  - If on the `main` branch, a version is pushed on the main distribution tag (a.k.a. `latest`, which is used when someone runs `npm i rdme` with no other specifiers).
  - If on the `next` branch, the prerelease distribution tag (a.k.a. [`next`](https://www.npmjs.com/package/rdme/v/next)) is updated.
- A [GitHub release is created](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release) for the tag (in draft form) 🐙
- If on the `main` branch, the new changes are backported to the `next` branch so both branches remain in sync 🔄

## One more thing ☝️

> [!NOTE]
> This section is only required if you're building an actual release and not a prelease (i.e., changes are being merged into the `main` branch).

While nearly all of our release process is automated, there's one more step left before we call it a day — writing up and publishing [the GitHub release](https://github.com/readmeio/rdme/releases)! The automation creates a GitHub release in a draft state, but it needs to be published so the latest version is surfaced to folks that discover our tool via [the GitHub Marketplace listing](https://github.com/marketplace/actions/rdme-sync-to-readme).

I like to summarize the changes and note any highlights in a blurb above the auto-generated release notes. These release links are nice for sharing with customers, on socials, etc. and because of the way that GitHub's algorithm works, they present a great opportunity for our developer tools to get more visibility — so definitely worth putting a little thought and care into these!
