#! /usr/bin/env node
const simpleGit = require('simple-git');

const { getPkgVersion } = require('../dist/src/lib/getPkgVersion');

const git = simpleGit();

/**
 * Sets tags as part of release process
 */
async function setTag() {
  const fullVersion = await getPkgVersion();
  const majorVersion = await getPkgVersion('major');

  git.tag([`v${majorVersion}`, '-f', '-m', `Alias for ${fullVersion}`]).catch(e => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
}

setTag();
