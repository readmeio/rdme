#! /usr/bin/env node
const { getNodeVersion } = require('../dist/src/lib/getNodeVersion');
const { getPkgVersion } = require('../dist/src/lib/getPkgVersion');

const name1 = 'RDME_VERSION';
const name2 = 'NODE_VERSION';

/**
 * Sets output parameters for GitHub Actions workflow
 * Docs: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter
 */
async function setOutputs() {
  console.log(`::set-output name=${name1}::${await getPkgVersion('latest')}`); // eslint-disable-line no-console
  console.log(`::set-output name=${name2}::${getNodeVersion()}`); // eslint-disable-line no-console
}

setOutputs();
