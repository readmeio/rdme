#! /usr/bin/env node
const core = require('@actions/core');

const { getNodeVersion, getPkgVersion } = require('../dist/src/lib/getPkgVersion');

/**
 * Sets output parameters for GitHub Actions workflow
 * Docs: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter
 */
async function setOutputs() {
  core.setOutput('RDME_VERSION', await getPkgVersion('latest'));
  core.setOutput('NODE_VERSION', getNodeVersion());
}

setOutputs();
