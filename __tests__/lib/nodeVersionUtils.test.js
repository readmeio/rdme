const { isSupportedNodeVersion, getNodeVersion } = require('../../src/lib/nodeVersionUtils');
const pkg = require('../../package.json');
const semver = require('semver');

describe('#isSupportedNodeVersion()', () => {
  it('should return true for a supported version of node', () => {
    expect(isSupportedNodeVersion('14.5.1')).toBe(true);
    expect(isSupportedNodeVersion('16.0.0')).toBe(true);
  });

  it('should return false for an unsupported version of node', () => {
    expect(isSupportedNodeVersion('10.0.0')).toBe(false);
    expect(isSupportedNodeVersion('12.0.0')).toBe(false);
    expect(isSupportedNodeVersion('18.0.0')).toBe(false);
  });
});

describe('#getNodeVersion()', () => {
  it('should extract version that matches range in package.json', () => {
    const version = parseInt(getNodeVersion(), 10);
    const cleanedVersion = semver.valid(semver.coerce(version));
    expect(semver.satisfies(cleanedVersion, pkg.engines.node)).toBe(true);
  });
});
