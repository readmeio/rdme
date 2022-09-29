import type { Response } from 'simple-git';

import fs from 'fs';

import configstore from '../../src/lib/configstore';
import { git } from '../../src/lib/createGHA';
import * as getPkgVersion from '../../src/lib/getPkgVersion';

import getGitRemoteMock from './get-git-mock';

const testWorkingDir = process.cwd();

/**
 *  A helper function for setting up tests for our GitHub Action onboarding.
 *
 * @param writeFileSyncCb the mock function that should be called
 * in place of `fs.writeFileSync`
 * @see {@link __tests__/lib/createGHA.test.ts}
 */
export function before(writeFileSyncCb) {
  fs.writeFileSync = jest.fn(writeFileSyncCb);

  git.checkIsRepo = jest.fn(() => {
    return Promise.resolve(true) as unknown as Response<boolean>;
  });

  git.remote = getGitRemoteMock();

  // global Date override to handle timestamp generation
  // stolen from here: https://github.com/facebook/jest/issues/2234#issuecomment-294873406
  const DATE_TO_USE = new Date('2022');
  // @ts-expect-error we're just overriding the constructor for tests,
  // no need to construct everything
  global.Date = jest.fn(() => DATE_TO_USE);

  process.env.TEST_CREATEGHA = 'true';

  const spy = jest.spyOn(getPkgVersion, 'getPkgVersion');
  spy.mockReturnValue(Promise.resolve('7.8.9'));
}

/**
 * A helper function for tearing down tests for our GitHub Action onboarding.
 */
export function after() {
  configstore.clear();
  delete process.env.TEST_CREATEGHA;
  jest.clearAllMocks();
  process.chdir(testWorkingDir);
}
