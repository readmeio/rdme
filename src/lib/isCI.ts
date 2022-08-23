import ciDetect from '@npmcli/ci-detect';

/**
 * Small env check to determine if we're in a GitHub Actions environment.
 *
 * @see {@link https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables}
 */
export function isGHA() {
  return ciDetect() === 'github-actions';
}
