import type { Response } from 'simple-git';

import fs from 'node:fs';

import { vi } from 'vitest';

import configstore from '../../src/lib/configstore.js';
import * as getPkgVersion from '../../src/lib/getPkg.js';
import { git } from '../../src/lib/git.js';
import * as isCI from '../../src/lib/isCI.js';

const fsWriteFileSync = fs.writeFileSync;

/**
 * Creates a mock function for testing `git.remote`.
 */
export function getGitRemoteMock(
  /** remote to return (usually `origin`) */
  remote = 'origin',
  /** git URL for the given remote */
  remoteUrl = 'https://github.com/readmeio/rdme.git',
  /** the HEAD branch */
  defaultBranch = 'main',
) {
  return vi.fn<(typeof git)['remote']>(arr => {
    // first call (used to grab remote for usage in subsequent commands)
    if (!arr.length) {
      if (!remote) return Promise.reject(new Error('Bad mock uh oh')) as unknown as Response<string>;
      return Promise.resolve(remote) as unknown as Response<string>;
    }
    // second call (used to grab default branch)
    if (arr.length === 2 && arr[0] === 'show' && arr[1] === remote) {
      if (remote === 'bad-remote') {
        return Promise.reject(
          new Error(`fatal: unable to access '${remoteUrl}': Could not resolve host: ${remoteUrl}`),
        ) as unknown as Response<string>;
      }
      if (!defaultBranch) return Promise.reject(new Error('Bad mock uh oh')) as unknown as Response<string>;
      return Promise.resolve(`* remote origin
  Fetch URL: ${remoteUrl}
  Push  URL: ${remoteUrl}
  HEAD branch: ${defaultBranch}
`) as unknown as Response<string>;
    }

    // third call (used to grab remote URLs)
    if (arr.length === 1 && arr[0] === '-v') {
      if (!remoteUrl) return Promise.reject(new Error('Bad mock uh oh')) as unknown as Response<string>;
      return Promise.resolve(`origin  ${remoteUrl} (fetch)
origin  ${remoteUrl} (push)
    `) as unknown as Response<string>;
    }

    return Promise.reject(new Error('Bad mock uh oh')) as unknown as Response<string>;
  });
}

/**
 * Helper functions for setting up and tearing down tests for our GitHub Action onboarding.
 *
 * @see {@link __tests__/lib/createGHA.test.ts}
 */
export const gitMock = {
  before: function before(
    /** the mock function that should be called in place of `fs.writeFileSync` */
    writeFileSyncCb: typeof fs.writeFileSync = () => {},
  ) {
    fs.writeFileSync = vi.fn(writeFileSyncCb);

    git.checkIsRepo = vi.fn(() => {
      return Promise.resolve(true) as Response<boolean>;
    });

    git.remote = getGitRemoteMock();

    vi.setSystemTime(new Date('2022'));

    vi.stubEnv('TEST_RDME_CREATEGHA', 'true');

    const spy = vi.spyOn(getPkgVersion, 'getMajorPkgVersion');
    spy.mockResolvedValue(7);
  },

  after: function after() {
    configstore.clear();
    fs.writeFileSync = fsWriteFileSync;
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  },
};

/**
 * Helper functions for setting up tests for simulating a GitHub Actions runner environment
 */
export const githubActionsEnv = {
  before: function before() {
    vi.resetModules();

    // List of all GitHub Actions env variables:
    // https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
    vi.stubEnv('GITHUB_ACTION', '__repo-owner_name-of-action-repo');
    vi.stubEnv('GITHUB_ACTIONS', 'true');
    vi.stubEnv('GITHUB_REPOSITORY', 'octocat/Hello-World');
    vi.stubEnv('GITHUB_RUN_ATTEMPT', '3');
    vi.stubEnv('GITHUB_RUN_ID', '1658821493');
    vi.stubEnv('GITHUB_RUN_NUMBER', '3');
    vi.stubEnv('GITHUB_SERVER_URL', 'https://github.com');
    vi.stubEnv('GITHUB_SHA', 'ffac537e6cbbf934b08745a378932722df287a53');
    vi.stubEnv('TEST_RDME_CI', 'true');
    vi.stubEnv('TEST_RDME_GHA', 'true');

    const ciNameSpy = vi.spyOn(isCI, 'ciName');
    ciNameSpy.mockReturnValue('GitHub Actions (test)');
  },

  after: function after() {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  },
};
