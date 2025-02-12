import { describe, beforeAll, it, expect } from 'vitest';

import Command from '../../src/commands/lint.js';
import { runCommandAndReturnResult } from '../helpers/oclif.js';

const key = 'rdme_123';

describe('rdme lint', () => {
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    run = runCommandAndReturnResult(Command);
  });

  it('should do something', async () => {
    const results = await run(['__tests__/__fixtures__/docs/new-docs/new-doc.md', '--key', key]);
    expect(results).toBe('something happens now');
  });
});
  