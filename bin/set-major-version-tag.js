#! /usr/bin/env node
const { exec } = require('child_process');

const semverMajor = require('semver/functions/major');

const pkg = require('../package.json');

/**
 * Sets major git tag as part of release process
 *
 * @example v7
 */
async function setMajorVersionTag() {
  const fullVersion = pkg.version;
  const majorVersion = semverMajor(fullVersion);

  exec(`git tag v${majorVersion} -f -m 'Top-level tag pointing to ${fullVersion}'`, (err, stdout) => {
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
