import type { Response } from 'node-fetch';

import Enquirer from 'enquirer';
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
  let enquirer;

  beforeEach(() => {
    enquirer = new Enquirer({ show: false });
  });

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
    it('should allow user to choose a fork if flag is not passed', async () => {
      const opts = { main: true, beta: true };

      enquirer.on('prompt', async prompt => {
        await prompt.keypress(null, { name: 'down' });
        await prompt.keypress(null, { name: 'up' });
        await prompt.submit();
        if (prompt.name === 'newVersion') {
          // eslint-disable-next-line no-param-reassign
          prompt.value = '1.2.1';
          await prompt.submit();
        }
      });
      const answer = await enquirer.prompt(promptHandler.createVersionPrompt(versionlist, opts));
      expect(answer.is_hidden).toBe(false);
      expect(answer.from).toBe('1');
    });

    it('should skip fork prompt if value passed', async () => {
      const opts = {
        version: '1',
        codename: 'test',
        fork: '1.0.0',
        main: false,
        beta: true,
        isPublic: false,
      };

      enquirer.on('prompt', async prompt => {
        if (prompt.name === 'newVersion') {
          // eslint-disable-next-line no-param-reassign
          prompt.value = '1.2.1';
          await prompt.submit();
        }
        await prompt.submit();
        await prompt.submit();
        await prompt.submit();
      });
      const answer = await enquirer.prompt(
        promptHandler.createVersionPrompt(versionlist, opts, { is_stable: '1.2.1' })
      );
      expect(answer.is_hidden).toBe(false);
      expect(answer.from).toBe('');
    });
  });
});
