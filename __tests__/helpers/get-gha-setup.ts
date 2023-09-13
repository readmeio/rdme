import type { Response } from 'simple-git';

import fs from 'fs';

import { vi } from 'vitest';

import configstore from '../../src/lib/configstore';
import { git } from '../../src/lib/createGHA';
import * as getPkgVersion from '../../src/lib/getPkgVersion';

import getGitRemoteMock from './get-git-mock';

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

  vi.useFakeTimers();

  git.remote = getGitRemoteMock();

  vi.setSystemTime(new Date('2022'));

  process.env.TEST_RDME_CREATEGHA = 'true';

  const spy = vi.spyOn(getPkgVersion, 'getMajorPkgVersion');
  spy.mockResolvedValue(7);
}

/**
 * A helper function for tearing down tests for our GitHub Action onboarding.
 */
export function after() {
  configstore.clear();
  delete process.env.TEST_RDME_CREATEGHA;
  vi.clearAllMocks();
  vi.useRealTimers();
}
