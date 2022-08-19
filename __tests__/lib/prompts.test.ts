import type { VersionCreateOptions } from '../../src/cmds/versions/create';
import type { Response } from 'node-fetch';

import prompts from 'prompts';

import * as promptHandler from '../../src/lib/prompts';
import promptTerminal from '../../src/lib/promptWrapper';

const versionlist = [
  {
    version: '1',
  },
  {
    version: '2',
  },
];

const specList = [
  {
    _id: 'spec1',
    title: 'spec1_title',
  },
  {
    _id: 'spec2',
    title: 'spec2_title',
  },
];

const getSpecs = () => {
  return {
    body: [
      {
        _id: 'spec3',
        title: 'spec3_title',
      },
    ],
  } as unknown as Promise<Response>;
};

describe('prompt test bed', () => {
  describe('generatePrompts()', () => {
    it('should return an update option if selected', async () => {
      prompts.inject(['update', '2']);

      const answer = await promptTerminal(promptHandler.generatePrompts(versionlist));
      expect(answer).toStrictEqual({ option: 'update', versionSelection: '2' });
    });

    it('should return a create option if selected', async () => {
      prompts.inject(['create', '1.1']);

      const answer = await promptTerminal(promptHandler.generatePrompts(versionlist));
      expect(answer).toStrictEqual({ newVersion: '1.1', option: 'create' });
    });

    it('should return an update option if selectOnly=true', async () => {
      prompts.inject(['2']);

      const answer = await promptTerminal(promptHandler.generatePrompts(versionlist, true));
      expect(answer).toStrictEqual({ versionSelection: '2' });
    });
  });

  describe('createOasPrompt()', () => {
    it('should return a create option if selected', async () => {
      prompts.inject(['create']);

      const answer = await promptTerminal(
        promptHandler.createOasPrompt(
          [
            {
              _id: '1234',
              title: 'buster',
            },
          ],
          {},
          1,
          null
        )
      );

      expect(answer).toStrictEqual({ option: 'create' });
    });

    it('should return specId if user chooses to update file', async () => {
      prompts.inject(['update', 'spec1']);

      const parsedDocs = {
        next: {
          page: 2,
          url: '',
        },
        prev: {
          page: 1,
          url: '',
        },
      };

      const answer = await promptTerminal(promptHandler.createOasPrompt(specList, parsedDocs, 1, getSpecs));

      expect(answer).toStrictEqual({ option: 'spec1' });
    });
  });

  describe('createVersionPrompt()', () => {
    it('should allow user to choose a fork if flag is not passed (creating version)', async () => {
      const opts = { newVersion: '1.2.1' } as VersionCreateOptions;

      prompts.inject(['1', true, true]);

      const answer = await promptTerminal(promptHandler.createVersionPrompt(versionlist, opts));
      expect(answer).toStrictEqual({ from: '1', is_stable: true, is_beta: true });
    });

    it('should skip fork prompt if value passed (updating version)', async () => {
      prompts.inject(['1.2.1', false, true, true, false]);

      const answer = await promptTerminal(promptHandler.createVersionPrompt(versionlist, {}, { is_stable: false }));
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
