import { afterEach, describe, expect, it, vi } from 'vitest';

import isCI, { ciName, isGHA, isNpmScript, isTest } from '../../src/lib/isCI.js';

describe('#isCI', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should report the vitest environment as our testbed', () => {
    expect(isTest()).toBe(true);
  });

  it('should not treat the test runner as CI unless TEST_RDME_CI is set', () => {
    expect(isCI()).toBe(false);

    vi.stubEnv('TEST_RDME_CI', 'true');

    expect(isCI()).toBe(true);
  });

  it('should not treat the test runner as GitHub Actions unless TEST_RDME_GHA is set', () => {
    expect(isGHA()).toBe(false);
    expect(ciName()).not.toBe('GitHub Actions (test)');

    vi.stubEnv('TEST_RDME_GHA', 'true');

    expect(isGHA()).toBe(true);
    expect(ciName()).toBe('GitHub Actions (test)');
  });

  it('should not treat an npm lifecycle as a user script while tests are running', () => {
    expect(isNpmScript()).toBe(false);

    vi.stubEnv('TEST_RDME_NPM_SCRIPT', 'true');

    expect(isNpmScript()).toBe(true);
  });
});
