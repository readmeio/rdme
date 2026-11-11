#! /usr/bin/env node

// @ts-check
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { parse } from 'semver';

/**
 * Decide how `changeset publish` should publish this ref.
 * Trusted publishing authenticates `npm publish`. Do not set `NPM_TOKEN` or `NODE_AUTH_TOKEN`.
 *
 * @param {string | undefined} ref Git ref, such as `refs/heads/main`
 * @param {string} version `package.json` version
 * @returns {{ tag?: string, error?: string }}
 */
export function getPublishPlan(ref, version) {
  const parsed = parse(version);

  if (!parsed) {
    return { error: `Unable to parse version "${version}".` };
  }

  if (parsed.prerelease.length) {
    return { error: `Refusing to publish prerelease version ${version}.` };
  }

  if (ref === 'refs/heads/v9') {
    if (parsed.major !== 9) {
      return { error: `Refusing to publish ${version} from v9. Releases from this branch stay on 9.x.` };
    }

    // An untagged 9.x publish would move the `latest` dist-tag backwards.
    return { tag: 'release-v9' };
  }

  if (ref === 'refs/heads/main') {
    if (parsed.major < 10) {
      return { error: `Refusing to publish ${version} from main. 9.x releases belong on the v9 branch.` };
    }

    return {};
  }

  return { error: `Refusing to publish from ${ref || 'an unknown ref'}.` };
}

function main() {
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const plan = getPublishPlan(process.env.GITHUB_REF, version);

  if (plan.error) {
    // oxlint-disable-next-line no-console -- This file is a release executable.
    console.error(plan.error);
    process.exit(1);
  }

  const args = [fileURLToPath(new URL('../node_modules/@changesets/cli/bin.js', import.meta.url)), 'publish'];

  if (plan.tag) {
    args.push('--tag', plan.tag);
  }

  // Inherit `CHANGESETS_OUTPUT` so `changesets/action` can push the `vX.Y.Z` tag and open the GitHub release.
  execFileSync(process.execPath, args, { stdio: 'inherit', env: process.env });
}

const entry = process.argv[1];

if (entry && import.meta.url === pathToFileURL(entry).href) {
  main();
}
