import { describe, expect, it } from 'vitest';

import { normalizeAPIKey } from '../../src/lib/getCurrentConfig.js';

describe('#normalizeAPIKey()', () => {
  it('returns undefined for missing or whitespace-only values', () => {
    expect(normalizeAPIKey('')).toBeUndefined();
    expect(normalizeAPIKey('   ')).toBeUndefined();
    expect(normalizeAPIKey('\t\n')).toBeUndefined();
  });

  it('returns trimmed non-empty strings', () => {
    expect(normalizeAPIKey('  rdme_abc  ')).toBe('rdme_abc');
    expect(normalizeAPIKey('x')).toBe('x');
  });
});
