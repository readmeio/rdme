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
    // eslint-disable-next-line no-console
    console.log(chunk.toString());
  });

  child.stderr?.on('data', chunk => {
    // eslint-disable-next-line no-console
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
    console.log(
      'kanad test',
      JSON.stringify({
        GITHUB_BASE_REF: process.env.GITHUB_BASE_REF,
        GITHUB_HEAD_REF: process.env.GITHUB_HEAD_REF,
        GITHUB_REF: process.env.GITHUB_REF,
        GITHUB_REF_NAME: process.env.GITHUB_REF_NAME,
        GITHUB_REF_PROTECTED: process.env.GITHUB_REF_PROTECTED,
        GITHUB_REF_TYPE: process.env.GITHUB_REF_TYPE,
        GITHUB_WORKFLOW_REF: process.env.GITHUB_WORKFLOW_REF,
      }),
    );

    const parsedVersion = parse(pkg.version);

    if (!parsedVersion) {
      throw new Error('Unable to extract semver data from the `package.json` version.');
    }

    if (parsedVersion.prerelease.length) {
      // eslint-disable-next-line no-console
      console.warn('Pre-release version, not setting major version tag');
      return;
    }

    const majorTag = `v${parsedVersion.major}`;

    await runGitCmd(['tag', majorTag, '--force', '--message', `Top-level tag pointing to ${parsedVersion.version}`]);

    const args = process.argv.slice(2);

    if (args[0] === 'push') {
      await runGitCmd(['push', 'origin', majorTag, '--force']);
      // eslint-disable-next-line no-console
      console.log(`🏷️  Created and pushed ${majorTag}`);
    } else {
      // eslint-disable-next-line no-console
      console.log("Not pushing, missing 'push' argument");
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error running git major version tagging script!');
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
}

setMajorVersionTag();
