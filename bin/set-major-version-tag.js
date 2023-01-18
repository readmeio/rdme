#! /usr/bin/env node
/* eslint-disable no-console */
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
    console.warn('Pre-release version, not setting major version tag');
    return;
  }

  exec(`git tag v${parsedVersion.major} -f -m 'Top-level tag pointing to ${parsedVersion.version}'`, (err, stdout) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    if (stdout) console.log(stdout);
  });
}

setMajorVersionTag();
