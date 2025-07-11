import nock from 'nock';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import pkg from '../../package.json' with { type: 'json' };
import { getNodeVersion, getPkgVersion, getPkgVersionFromNPM } from '../../src/lib/getPkg.js';

describe('#getNodeVersion()', () => {
  it('should return a major version', () => {
    const version = getNodeVersion();

    expect(version).toHaveLength(2);
  });
});

describe('#getPkgVersion()', () => {
  let consoleErrorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should grab version from package.json by default', () => {
    return expect(getPkgVersion()).toBe(pkg.version);
  });

  it('should fetch version from npm registry', async () => {
    const mock = nock('https://registry.npmjs.com', { encodedQueryParams: true })
      .get('/rdme')
      .reply(200, { 'dist-tags': { latest: '1.0' } });

    await expect(getPkgVersionFromNPM('latest')).resolves.toBe('1.0');

    mock.done();
  });

  it('should fallback if npm registry fails', async () => {
    const mock = nock('https://registry.npmjs.com', { encodedQueryParams: true }).get('/rdme').reply(500);

    await expect(getPkgVersionFromNPM('latest')).resolves.toBe(pkg.version);

    mock.done();
  });
});
