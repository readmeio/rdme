# Changesets

A pull request that should ship in the next stable `rdme` release needs a changeset. Run `npx changeset` from the repo root and commit the file it writes. Dependency bumps and other changes that should not release can omit one.

Merging that pull request does not publish. It updates the open Version Packages pull request. Publishing happens when that pull request is merged. See [MAINTAINERS.md](../MAINTAINERS.md).
