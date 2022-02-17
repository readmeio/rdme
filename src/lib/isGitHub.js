/**
 * Small env check to determine if we're in a GitHub Actions environment
 * @link https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
 */
module.exports = function isGHA() {
  return process.env.GITHUB_ACTIONS === 'true';
};
