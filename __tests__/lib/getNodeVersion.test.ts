import getNodeVersion from '../../src/lib/getNodeVersion';
import pkg from '../../package.json';
import semver from 'semver';

describe('#getNodeVersion()', () => {
  it('should extract version that matches range in package.json', () => {
    const version = parseInt(getNodeVersion(), 10);
    const cleanedVersion = semver.valid(semver.coerce(version));
    expect(semver.satisfies(cleanedVersion as string, pkg.engines.node)).toBe(true);
  });
});
