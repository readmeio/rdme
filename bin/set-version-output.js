#! /usr/bin/env node
const core = require('@actions/core');

const { getMajorPkgVersion, getNodeVersion, getPkgVersion } = require('../dist/src/lib/getPkgVersion');

/**
 * Sets output parameters for GitHub Actions workflow so we can do
 * a find-and-replace in our docs prior to syncing them to ReadMe
 * and also to tag our Docker images properly
 * Docs: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter
 */
async function setOutputs() {
  core.setOutput('NODE_VERSION', getNodeVersion());
  core.setOutput('RDME_LATEST_MAJOR_VERSION', `v${await getMajorPkgVersion('latest')}`);
  core.setOutput('RDME_PKG_VERSION', await getPkgVersion());
}

setOutputs();
