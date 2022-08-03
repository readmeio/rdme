#! /usr/bin/env node
import getNodeVersion from '../src/lib/getNodeVersion.js';
import pkg from '../src/lib/getPackage.js';

const name1 = 'RDME_VERSION';
const name2 = 'NODE_VERSION';

/**
 * Sets output parameters for GitHub Actions workflow
 * Docs: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter
 */
console.log(`::set-output name=${name1}::${pkg.version}`); // eslint-disable-line no-console
console.log(`::set-output name=${name2}::${getNodeVersion()}`); // eslint-disable-line no-console
