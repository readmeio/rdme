const isSupportedNodeVersion = require('../../src/lib/isSupportedNodeVersion');

describe('#isSupportedNodeVersion()', () => {
  it('should return true for a supported version of node', () => {
    expect(isSupportedNodeVersion('14.5.1')).toBe(true);
    expect(isSupportedNodeVersion('16.0.0')).toBe(true);
    expect(isSupportedNodeVersion('18.0.0')).toBe(true);
  });

  it('should return false for an unsupported version of node', () => {
    expect(isSupportedNodeVersion('10.0.0')).toBe(false);
    expect(isSupportedNodeVersion('12.0.0')).toBe(false);
  });
});
