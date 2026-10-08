import type { Hook } from '@oclif/core';

import { afterEach, describe, expect, it, vi } from 'vitest';

import configstore from '../../src/lib/configstore.js';
import getCurrentConfig, { normalizeAPIKey } from '../../src/lib/getCurrentConfig.js';

describe('#normalizeAPIKey()', () => {
  it('returns undefined for missing or whitespace-only values', () => {
    const missing: string | undefined = undefined;
    expect(normalizeAPIKey(missing)).toBeUndefined();
    expect(normalizeAPIKey('')).toBeUndefined();
    expect(normalizeAPIKey('   ')).toBeUndefined();
    expect(normalizeAPIKey('\t\n')).toBeUndefined();
  });

  it('returns trimmed non-empty strings', () => {
    expect(normalizeAPIKey('  rdme_abc  ')).toBe('rdme_abc');
    expect(normalizeAPIKey('x')).toBe('x');
  });
});

describe('#getCurrentConfig()', () => {
  const ctx = { debug: vi.fn() } as unknown as Hook.Context;

  afterEach(() => {
    vi.unstubAllEnvs();
    configstore.clear();
  });

  it('prefers RDME_API_KEY over README_API_KEY and configstore', () => {
    configstore.set('apiKey', 'from-store');
    vi.stubEnv('README_API_KEY', 'from-readme');
    vi.stubEnv('RDME_API_KEY', 'from-rdme');

    expect(getCurrentConfig.call(ctx).apiKey).toBe('from-rdme');
  });

  it('prefers README_API_KEY over configstore when RDME_API_KEY is absent', () => {
    configstore.set('apiKey', 'from-store');
    vi.stubEnv('RDME_API_KEY', '');
    vi.stubEnv('README_API_KEY', 'from-readme');

    expect(getCurrentConfig.call(ctx).apiKey).toBe('from-readme');
  });

  it('ignores whitespace-only API key environment variables and falls back to configstore', () => {
    configstore.set('apiKey', 'from-store');
    vi.stubEnv('RDME_API_KEY', '   ');
    vi.stubEnv('README_API_KEY', '\t');

    expect(getCurrentConfig.call(ctx).apiKey).toBe('from-store');
  });

  it('prefers RDME_EMAIL and RDME_PROJECT environment variables over configstore', () => {
    configstore.set('email', 'store@example.com');
    configstore.set('project', 'store-project');
    vi.stubEnv('RDME_EMAIL', 'env@example.com');
    vi.stubEnv('RDME_PROJECT', 'env-project');

    expect(getCurrentConfig.call(ctx)).toMatchObject({
      email: 'env@example.com',
      project: 'env-project',
    });
  });
});
