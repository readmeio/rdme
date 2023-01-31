import ci from 'ci-info'; // eslint-disable-line no-restricted-imports

/**
 * Wrapper function that returns the name of the current CI environment
 * (or "n/a" if it's not available).
 *
 * Full list of vendors available here:
 * https://github.com/watson/ci-info#supported-ci-tools
 */
export function ciName() {
  return ci.name || 'n/a';
}

/**
 * Small env check to determine if we're running our testbed
 */
export function isTest() {
  return process.env.NODE_ENV === 'rdme-test';
}

/**
 * Small env check to determine if the current command is being run
 * via an npm (or yarn) script.
 *
 * The reason we have this weird conditional logic is because we run our tests via
 * an npm script and we don't want false positives when running tests.
 *
 * @see {@link https://docs.npmjs.com/cli/v8/using-npm/scripts#current-lifecycle-event}
 * @see {@link https://docs.npmjs.com/cli/v6/using-npm/scripts#current-lifecycle-event}
 * @see {@link https://yarnpkg.com/advanced/lifecycle-scripts}
 */
export function isNpmScript() {
  /* istanbul ignore next */
  return (!!process.env.npm_lifecycle_event && !isTest()) || !!process.env.TEST_RDME_NPM_SCRIPT;
}

/**
 * Small check to ensure we're in a safe CI environment.
 *
 * The reason we have this weird conditional logic is because we run our tests in
 * a CI environment and we don't want false positives when running tests.
 */
export default function isCI() {
  /* istanbul ignore next */
  return (ci.isCI && !isTest()) || !!process.env.TEST_RDME_CI;
}

/**
 * Small env check to determine if we're in a GitHub Actions environment.
 *
 * @see {@link https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables}
 */
export function isGHA() {
  return isCI() && ci.GITHUB_ACTIONS;
}
