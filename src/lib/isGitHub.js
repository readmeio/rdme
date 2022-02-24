/**
 * Small env check to determine if we're in a GitHub Actions environment
 * @link https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
 */
module.exports = function isGHA() {
  // eslint-disable-next-line global-require
  return require('ci-info').GITHUB_ACTIONS;
};
