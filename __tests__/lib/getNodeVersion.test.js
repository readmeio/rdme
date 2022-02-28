const getNodeVersion = require('../../src/lib/getNodeVersion');
const pkg = require('../../package.json');
const semver = require('semver');

describe('#getNodeVersion()', () => {
  it('should extract version that matches range in package.json', () => {
    const version = parseInt(getNodeVersion(), 10);
    const cleanedVersion = semver.valid(semver.coerce(version));
    expect(semver.satisfies(cleanedVersion, pkg.engines.node)).toBe(true);
  });
});
