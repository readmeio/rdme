import { describe, expect, it } from 'vitest';

import { args, baseFlags, description, examples, summary } from '../../src/lib/pageCommandProperties.js';

describe('pageCommandProperties', () => {
  it.each(['Guides', 'Reference', 'Changelog', 'Custom Pages'] as const)(
    'should describe the %s upload command',
    section => {
      expect(summary(section)).toMatch(/Upload /);
      expect(description(section)).toContain('path');
      expect(args(section).path.required).toBe(true);
      expect(examples(section).length).toBeGreaterThan(0);
      expect(baseFlags(section)['dry-run']).toBeDefined();
    },
  );

  it('should throw for an unknown section', () => {
    expect(() => baseFlags('Unknown' as never)).toThrow('Unknown section: Unknown');
  });
});
