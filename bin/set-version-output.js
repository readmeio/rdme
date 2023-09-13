#! /usr/bin/env node
import * as core from '@actions/core';

// eslint-disable-next-line import/extensions
import { getNodeVersion, getMajorPkgVersion } from '../dist/src/lib/getPkgVersion.js';

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
