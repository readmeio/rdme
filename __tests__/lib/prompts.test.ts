import prompts from 'prompts';
import { describe, it, expect } from 'vitest';

import * as promptHandler from '../../src/lib/prompts.js';
import promptTerminal from '../../src/lib/promptWrapper.js';

const versionlist = [
  {
    version: '1',
    is_stable: true,
  },
  {
    version: '2',
    is_stable: false,
  },
];

describe('prompt test bed', () => {
  describe('versionPrompt()', () => {
    it('should allow user to choose a fork if flag is not passed (creating version)', async () => {
      prompts.inject(['1', true, true]);

      const answer = await promptTerminal(promptHandler.versionPrompt(versionlist));
      expect(answer).toStrictEqual({ from: '1', is_stable: true, is_beta: true });
    });

    it('should skip fork prompt if value passed (updating version)', async () => {
      prompts.inject(['1.2.1', false, true, true, false]);

      const answer = await promptTerminal(promptHandler.versionPrompt(versionlist, { is_stable: false }));
      expect(answer).toStrictEqual({
        newVersion: '1.2.1',
        is_stable: false,
        is_beta: true,
        is_hidden: true,
        is_deprecated: false,
      });
    });
  });
});
