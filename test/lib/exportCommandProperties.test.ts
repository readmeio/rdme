import { describe, expect, it } from 'vitest';

import { args, description, examples, flags, summary } from '../../src/lib/exportCommandProperties.js';

describe('exportCommandProperties', () => {
  it.each(['Guides', 'Reference', 'Changelog', 'Custom Pages'] as const)(
    'should describe the %s export command',
    section => {
      expect(summary(section)).toMatch(/Export /);
      expect(description(section, 'docs')).toContain('Downloads');
      expect(args(section).folder.required).toBe(true);
      expect(examples(section).length).toBeGreaterThan(0);
      expect(flags(section).key).toBeDefined();
    },
  );

  it('should throw for an unknown section', () => {
    expect(() => summary('Unknown' as never)).toThrow(TypeError);
  });
});
