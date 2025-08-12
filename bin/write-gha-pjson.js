#! /usr/bin/env node

// @ts-check

import fs from 'node:fs';
import path from 'node:path';

const newTarget = './commands.js';

/**
 * We need to duplicate the `package.json` file (with a few modifications) from the root of the project to the
 * `dist-gha` directory, so that the GitHub Actions-flavored `oclif` configuration can find it.
 */
function writeGitHubActionsPackageJson() {
  const current = JSON.parse(
    fs.readFileSync(path.resolve(import.meta.dirname, '../package.json'), { encoding: 'utf-8' }),
  );

  current.private = true;

  // set the correct targets for GitHub Actions
  current.oclif.commands.target = newTarget;
  Object.values(current.oclif.hooks).forEach(hook => {
    hook.target = newTarget;
  });

  // remove properties that are only applicable in a CLI context
  delete current.oclif.helpClass;
  delete current.oclif.plugins;

  // Add GitHub Actions debug statement
  // (we cannot use the '@actions/core' package here since we do not have access to any of our npm dependencies)
  // biome-ignore lint/suspicious/noConsole: This file is a wrapper for emitting logs to GH Actions.
  console.log(`::debug::writing package.json to dist-gha: ${JSON.stringify(current)}`);

  // write the new package.json file
  fs.writeFileSync(path.resolve(import.meta.dirname, '../dist-gha/package.json'), JSON.stringify(current, null, 2));
}

writeGitHubActionsPackageJson();
