#! /usr/bin/env node

// @ts-check
import { execFile as unpromisifiedExecFile } from 'node:child_process';
import { promisify } from 'node:util';

import { parse } from 'semver';

import pkg from '../package.json' with { type: 'json' };

const execFile = promisify(unpromisifiedExecFile);

/**
 * @param {string[]} args
 */
async function git(args) {
  await execFile('git', args);
}

/**
 * Push the unprefixed version tag (`10.10.2` alongside `v10.10.2`) and, on main, the floating major tag.
 * `changesets publish` only creates the `v` tag.
 */
async function pushExtraReleaseTags() {
  const parsed = parse(pkg.version);

  if (!parsed) {
    throw new Error(`Unable to parse version "${pkg.version}".`);
  }

  if (parsed.prerelease.length) {
    throw new Error(`Refusing to tag prerelease version ${pkg.version}.`);
  }

  const { stdout } = await execFile('git', ['ls-remote', '--tags', 'origin', `refs/tags/${pkg.version}`]);

  if (stdout.trim()) {
    // oxlint-disable-next-line no-console -- This file is a release executable.
    console.log(`Tag ${pkg.version} already exists`);
  } else {
    await git(['tag', pkg.version]);
    await git(['push', 'origin', `refs/tags/${pkg.version}`]);
    // oxlint-disable-next-line no-console -- This file is a release executable.
    console.log(`Created and pushed ${pkg.version}`);
  }

  await execFile(process.execPath, ['bin/set-major-version-tag.js', 'push']);
}

try {
  await pushExtraReleaseTags();
} catch (error) {
  // oxlint-disable-next-line no-console -- This file is a release executable.
  console.error(error);
  process.exit(1);
}
