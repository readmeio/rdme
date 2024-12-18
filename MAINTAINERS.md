# Maintainers

This doc describes how releases are published to GitHub and `npm`.

## Automatic Packaging + Publishing 📦

Nearly all of our release process is automated. In this section, we discuss everything that takes place!

> [!NOTE]
> You don't _need_ to know everything that takes place here, this is mostly for my own documentation purposes! But if you are tagging an actual release, there are a couple of outstanding steps that are described in [the next section](#one-more-thing-☝️) 👇

When code is merged into the `main` or `next` branches, a release workflow (powered by [`semantic-release`](https://github.com/semantic-release/semantic-release)) automatically kicks off that does the following:

- All commit messages since the last release are analyzed to determine whether or not the new changes warrant a new release (i.e., if the changes are features or fixes as opposed to smaller housekeeping changes) 🧐
- Based on the changes, the version is bumped in [`package.json`](./package.json) 🥊 For example, say the current version is `8.5.1` and the commit history includes a new feature. This would result in a minor semver bump, which would produce the following tags:
  - A release tag like `v8.6.0` if on the `main` or `v9` branches
  - A prerelease tag like `v8.6.0-next.1` if on the `next` branch
- A few other files, such as [`CHANGELOG.md`](./CHANGELOG.md), [the command reference pages](./documentation/commands), and our GitHub Actions bundle files, are updated based on this code 🪵
- A build commit (like [this](https://github.com/readmeio/rdme/commit/533a2db50b39c3b6130b3af07bebaed38218db4c)) is created with all of the updated files (e.g., `package.json`, `CHANGELOG.md`, etc.) 🆕
- A couple duplicated tags are created for the current commit so our users can refer to them differently in their GitHub Actions (e.g., `8.6.0`, `v8`) 🔖
- The new commit and tags are pushed to GitHub 📌
- The new version is published to the `npm` registry 🚀 The package [distribution tag](https://docs.npmjs.com/adding-dist-tags-to-packages) will depend on which branch is being pushed to:
  - If on the `main` branch, a version is pushed on the main distribution tag (a.k.a. `latest`, which is used when someone runs `npm i rdme` with no other specifiers).
  - If on the `next` branch, the prerelease distribution tag (a.k.a. [`next`](https://www.npmjs.com/package/rdme/v/next)) is updated.
  - If on the `v9` branch, there is no distribution tag, but any minor/patch changes on this branch are automatically released to the 9.x release channel.
- A [GitHub release is created](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release) for the tag 🐙
- If on the `main` branch, the new changes are backported to the `next` branch so both branches remain in sync 🔄

### Maintaining two major release channels

We maintain two different release channels:

- one for `v9` (so we can have a release that supports all functionality pre-ReadMe Refactored, more in [our migration guide](./documentation/migration-guide.md))
- one for the latest release (`v10`, as of this writing — `v10` and onward are for customers on ReadMe Refactored only)

All new feature development should be on the `next` branch. If the feature does not interact with the ReadMe API in anyway (e.g., a docs change, an OpenAPI utility command), we can backport the change to the `v9` branch.

Here's the recommended approach:

1. Once the pull request has been merged into `next`, grab the merge commit SHA.
2. Check out the `v9` branch, create a new branch based off of that branch, and cherry-pick the aformentioned commit SHA:

   ```sh
   git checkout v9
   git checkout -b my-v9-backport-branch
   git cherry-pick SHA
   ```

3. Create a new pull request and set the base branch to `v9`.
4. Once CI passes and you get the necessary approvals, merge that pull request in.
5. The final step ensures that everything in the `next` branch is a superset of everything in the `v9` branch. To do this, checkout the `next` branch and merge `v9` into it.

   ```sh
   git checkout next
   git merge v9
   ```

## One more thing ☝️

> [!NOTE]
> This section is only worth adhering to if you're building an actual release and not a prelease (i.e., changes are being merged into the `main` branch).

While nearly all of our release process is automated, there's one more step left before we call it a day — enhancing [the GitHub release](https://github.com/readmeio/rdme/releases)! The automation auto-generates and publishes a GitHub release, but it's often nice to add some human-generated language for folks that discover our tool via [the GitHub Marketplace listing](https://github.com/marketplace/actions/rdme-sync-to-readme).

I like to summarize the changes and note any highlights in a blurb above the auto-generated release notes. These release links are nice for sharing with customers, on socials, etc. and because of the way that GitHub's algorithm works, they present a great opportunity for our developer tools to get more visibility — so definitely worth putting a little thought and care into these!
