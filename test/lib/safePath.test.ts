import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { decodeURILastSegment, isSafePathSegment, resolvePathWithinRoot } from '../../src/lib/safePath.js';

describe('#isSafePathSegment', () => {
  it.each([
    ['main', true],
    ['my-category', true],
    ['intro', true],
    ['', false],
    ['.', false],
    ['..', false],
    ['../escape', false],
    ['..\\escape', false],
    ['foo/../bar', false],
    ['foo/bar', false],
    ['foo\\bar', false],
  ])('isSafePathSegment(%j) -> %s', (segment, expected) => {
    expect(isSafePathSegment(segment)).toBe(expected);
  });
});

describe('#decodeURILastSegment', () => {
  it('decodes a normal category segment', () => {
    expect(decodeURILastSegment('/branches/1.0/categories/guides/main')).toBe('main');
  });

  it('rejects encoded path traversal', () => {
    expect(decodeURILastSegment('/branches/1.0/categories/guides/%2e%2e%2fescape')).toBeNull();
  });
});

describe('#resolvePathWithinRoot', () => {
  const root = path.resolve('/tmp/export');

  it('resolves paths inside the root', () => {
    expect(resolvePathWithinRoot(root, 'main', 'intro.md')).toBe(path.resolve(root, 'main', 'intro.md'));
  });

  it('returns null when traversal escapes the root', () => {
    expect(resolvePathWithinRoot(root, '../outside', 'intro.md')).toBeNull();
  });

  it('allows the root directory itself', () => {
    expect(resolvePathWithinRoot(root)).toBe(root);
  });
});
