import { describe, expect, it } from 'vitest';

import { assertSlug } from '../../src/lib/slug.js';

describe('#assertSlug', () => {
  const filePath = 'changelog.md';

  it.each(['hello', 'foo..bar', 'hello world', 'café', '100%', '__proto__', '1.0+beta'])('accepts %j', slug => {
    expect(assertSlug(slug, filePath)).toBe(slug);
  });

  it('names the branch in the error', () => {
    expect(() => assertSlug('../projects/me', filePath, 'branch')).toThrow(
      `Invalid branch in ${filePath}: branches must be a single URL-safe path segment.`,
    );
  });

  it.each([
    '',
    '.',
    '..',
    '../docs/victim',
    '..\\docs\\victim',
    '%2e%2e',
    '%2e%2e/docs/victim',
    '.%2e',
    '%2e.',
    '%2E%2E',
    '%2e',
    'x?foo=1',
    'x#frag',
    'has\0null',
    'line\nbreak',
  ])('rejects %j', slug => {
    expect(() => assertSlug(slug, filePath)).toThrow(
      `Invalid slug in ${filePath}: slugs must be a single URL-safe path segment.`,
    );
  });

  it.each([undefined, null, 1, {}, []])('rejects non-string values (%j)', value => {
    expect(() => assertSlug(value, filePath)).toThrow(/Invalid slug/);
  });
});
