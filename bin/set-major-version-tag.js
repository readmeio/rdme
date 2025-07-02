#! /usr/bin/env node

// @ts-check
import { execFile as unpromisifiedExecFile } from 'node:child_process';
import { promisify } from 'node:util';

import { parse } from 'semver';

import pkg from '../package.json' with { type: 'json' };

const execFile = promisify(unpromisifiedExecFile);

/**
 * Runs command and logs all output
 */
async function runGitCmd(args) {
  // Promise-based approach grabbed from here: https://stackoverflow.com/a/63027900
  const execCmd = execFile('git', args);
  const child = execCmd.child;

  child.stdout?.on('data', chunk => {
    console.log(chunk.toString());
  });

  child.stderr?.on('data', chunk => {
    console.error(chunk.toString());
  });

  await execCmd;
}

/**
 * Sets major git tag as part of release process
 *
 * @example v7
 */
async function setMajorVersionTag() {
  try {
    // The major version tag should only be set when releasing on the `main` branch
    if (process.env.GITHUB_REF !== 'refs/heads/main') {
      console.warn(`Running with the following ref: ${process.env.GITHUB_REF || 'n/a'}, not setting major version tag`);
      return;
    }

    const parsedVersion = parse(pkg.version);

    if (!parsedVersion) {
      throw new Error('Unable to extract semver data from the `package.json` version.');
    }

    if (parsedVersion.prerelease.length) {
      console.warn('Pre-release version, not setting major version tag');
      return;
    }

    const majorTag = `v${parsedVersion.major}`;

    // we maintain a v9 branch, this just ensures that we don't attempt to also push a tag with the same ref
    if (majorTag === 'v9') {
      console.warn('A `v9` ref already exists, not setting major version tag');
      return;
    }

    await runGitCmd(['tag', majorTag, '--force', '--message', `Top-level tag pointing to ${parsedVersion.version}`]);

    const args = process.argv.slice(2);

    if (args[0] === 'push') {
      await runGitCmd(['push', 'origin', majorTag, '--force']);
      console.log(`🏷️  Created and pushed ${majorTag}`);
    } else {
      console.log("Not pushing, missing 'push' argument");
    }
  } catch (e) {
    console.error('Error running git major version tagging script!');
    console.error(e);
    process.exit(1);
  }
}

setMajorVersionTag();
