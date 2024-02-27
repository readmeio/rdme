import type { Response } from 'simple-git';

import fs from 'node:fs';

import { vi } from 'vitest';

import configstore from '../../src/lib/configstore.js';
import { git } from '../../src/lib/createGHA/index.js';
import * as getPkgVersion from '../../src/lib/getPkgVersion.js';

import getGitRemoteMock from './get-git-mock.js';

/**
 * A helper function for setting up tests for our GitHub Action onboarding.
 *
 * @param writeFileSyncCb the mock function that should be called in place of `fs.writeFileSync`.
 * @see {@link __tests__/lib/createGHA.test.ts}
 */
export function before(writeFileSyncCb) {
  fs.writeFileSync = vi.fn(writeFileSyncCb);

  git.checkIsRepo = vi.fn(() => {
    return Promise.resolve(true) as unknown as Response<boolean>;
  });

  git.remote = getGitRemoteMock();

  vi.setSystemTime(new Date('2022'));

  vi.stubEnv('TEST_RDME_CREATEGHA', 'true');

  const spy = vi.spyOn(getPkgVersion, 'getMajorPkgVersion');
  spy.mockResolvedValue(7);
}

/**
 * A helper function for tearing down tests for our GitHub Action onboarding.
 */
export function after() {
  configstore.clear();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
}
