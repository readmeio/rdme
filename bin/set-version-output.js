#! /usr/bin/env node
const core = require('@actions/core');

const { getNodeVersion, getMajorPkgVersion } = require('../dist/src/lib/getPkgVersion');

/**
 * Sets output parameters for GitHub Actions workflow so we can do
 * a find-and-replace in our docs prior to syncing them to ReadMe
 * Docs: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter
 */
async function setOutputs() {
  core.setOutput('RDME_VERSION', `v${await getMajorPkgVersion('latest')}`);
  core.setOutput('NODE_VERSION', getNodeVersion());
}

setOutputs();
