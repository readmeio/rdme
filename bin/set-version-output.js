#! /usr/bin/env node

// @ts-check
import * as core from '@actions/core';

// biome-ignore lint/correctness/useImportExtensions: This file exists but Biome wants to use the `.d.ts` file instead.
import { getMajorPkgVersion, getNodeVersion } from '../dist/lib/getPkg.js';

/**
 * Sets output parameters for GitHub Actions workflow so we can do
 * a find-and-replace in our docs prior to syncing them to ReadMe
 * Docs: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter
 */
async function setOutputs() {
  core.setOutput('RDME_VERSION', `v${await getMajorPkgVersion('latest')}`);
  core.setOutput('NODE_VERSION', getNodeVersion());
}

// biome-ignore lint/nursery/noFloatingPromises: We use rollup to bundle this file and it doesn't play well with top-level await.
setOutputs();
