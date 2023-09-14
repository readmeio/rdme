import { vi } from 'vitest';

import * as isCI from '../../src/lib/isCI.js';

/**
 * A helper function for setting up tests for simulating a GitHub Actions runner environment
 */
export function before() {
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

  const isGHASpy = vi.spyOn(isCI, 'isGHA');
  isGHASpy.mockReturnValue(true);

  const ciNameSpy = vi.spyOn(isCI, 'ciName');
  ciNameSpy.mockReturnValue('GitHub Actions (test)');
}

/**
 * A helper function for tearing down tests after simulating a GitHub Actions runner environment
 */
export function after() {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
}
