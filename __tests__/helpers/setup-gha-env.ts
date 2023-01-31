import * as isCI from '../../src/lib/isCI';

/**
 * A helper function for setting up tests for simulating a GitHub Actions runner environment
 */
export function before() {
  // List of all GitHub Actions env variables:
  // https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
  process.env.GITHUB_ACTION = '__repo-owner_name-of-action-repo';
  process.env.GITHUB_ACTIONS = 'true';
  process.env.GITHUB_REPOSITORY = 'octocat/Hello-World';
  process.env.GITHUB_RUN_ATTEMPT = '3';
  process.env.GITHUB_RUN_ID = '1658821493';
  process.env.GITHUB_RUN_NUMBER = '3';
  process.env.GITHUB_SERVER_URL = 'https://github.com';
  process.env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
  process.env.TEST_RDME_CI = 'true';

  const isGHASpy = jest.spyOn(isCI, 'isGHA');
  isGHASpy.mockReturnValue(true);

  const ciNameSpy = jest.spyOn(isCI, 'ciName');
  ciNameSpy.mockReturnValue('GitHub Actions (test)');
}

/**
 * A helper function for tearing down tests after simulating a GitHub Actions runner environment
 */
export function after() {
  delete process.env.GITHUB_ACTION;
  delete process.env.GITHUB_ACTIONS;
  delete process.env.GITHUB_REPOSITORY;
  delete process.env.GITHUB_RUN_ATTEMPT;
  delete process.env.GITHUB_RUN_ID;
  delete process.env.GITHUB_RUN_NUMBER;
  delete process.env.GITHUB_SERVER_URL;
  delete process.env.GITHUB_SHA;
  delete process.env.TEST_RDME_CI;
  jest.resetAllMocks();
}
