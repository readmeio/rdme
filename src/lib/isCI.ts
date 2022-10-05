import ciDetect from '@npmcli/ci-detect';

/**
 * Small env check to determine if we're in a GitHub Actions environment.
 *
 * @see {@link https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables}
 */
export function isGHA() {
  return ciDetect() === 'github-actions';
}

/**
 * Small check to ensure we're in a safe CI environment.
 *
 * The reason we have this `env` variable is because we run our tests in a CI environment
 * and we don't want false positives when running tests on logic only intended for CI.
 */
export default function isCI() {
  /* istanbul ignore next */
  return (ciDetect() && process.env.NODE_ENV !== 'test') || process.env.TEST_CI;
}
