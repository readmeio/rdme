import { describe, expect, it } from 'vitest';

import { assertSlug } from '../../src/lib/slug.js';

describe('#assertSlug', () => {
  const filePath = 'changelog.md';

  it.each([
    'hello',
    'foo..bar',
    'hello world',
    'café',
    '100%',
    '__proto__',
    '1.0+beta',
    'stable',
    'main',
    'main-es',
    'v1.0-alpha',
    'v1.0.0-alpha.1',
    '1.0.0-rc.1+build',
    'v1.0_suffix',
  ])('accepts %j', slug => {
    expect(assertSlug(slug, filePath)).toBe(slug);
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
    'v1.0-../x',
    'v1.0-alpha/evil',
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
