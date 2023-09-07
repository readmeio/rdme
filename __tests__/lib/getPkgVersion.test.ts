import nock from 'nock';
import semver from 'semver';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import pkg from '../../package.json' assert { type: 'json' };
import { getNodeVersion, getPkgVersion } from '../../src/lib/getPkgVersion.js';

describe('#getNodeVersion()', () => {
  it('should extract version that matches range in package.json', () => {
    const version = getNodeVersion();
    const cleanedVersion = semver.valid(semver.coerce(version));
    expect(semver.satisfies(cleanedVersion as string, pkg.engines.node)).toBe(true);
  });
});

describe('#getPkgVersion()', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();

    nock.cleanAll();
  });

  it('should grab version from package.json by default', () => {
    return expect(getPkgVersion()).resolves.toBe(pkg.version);
  });

  it('should fetch version from npm registry', async () => {
    const mock = nock('https://registry.npmjs.com', { encodedQueryParams: true })
      .get('/rdme')
      .reply(200, { 'dist-tags': { latest: '1.0' } });

    await expect(getPkgVersion('latest')).resolves.toBe('1.0');

    mock.done();
  });

  it('should fallback if npm registry fails', async () => {
    const mock = nock('https://registry.npmjs.com', { encodedQueryParams: true }).get('/rdme').reply(500);

    await expect(getPkgVersion('latest')).resolves.toBe(pkg.version);

    mock.done();
  });
});
