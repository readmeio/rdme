#! /usr/bin/env node
const { exec } = require('child_process');

const semverParse = require('semver/functions/parse');

const pkg = require('../package.json');

/**
 * Sets major git tag as part of release process
 *
 * @example v7
 */
async function setMajorVersionTag() {
  const parsedVersion = semverParse(pkg.version);

  if (parsedVersion.prerelease.length) {
    // eslint-disable-next-line no-console
    console.warn('Pre-release version, not setting major version tag');
    return;
  }

  exec(`git tag v${parsedVersion.jaor} -f -m 'Top-level tag pointing to ${parsedVersion.version}'`, (err, stdout) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    if (stdout) console.log(stdout);
  });
}

setMajorVersionTag();
