const Enquirer = require('enquirer');
const promptHandler = require('../../src/lib/prompts');

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
  return [
    {
      _id: 'spec3',
      title: 'spec3_title',
    },
  ];
};

describe('prompt test bed', () => {
  let enquirer;

  beforeEach(() => {
    enquirer = new Enquirer({ show: false });
  });

  describe('generatePrompts()', () => {
    it('should not allow selection of version if chosen to create new version', async () => {
      enquirer.on('prompt', async prompt => {
        // eslint-disable-next-line default-case
        switch (prompt.name) {
          case 'option':
            await prompt.keypress(null, { name: 'down' });
            await prompt.submit();
            break;

          case 'versionSelection':
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(prompt.skip()).resolves.toBe(true);
            break;

          case 'newVersion':
            // eslint-disable-next-line no-param-reassign
            prompt.value = '1.2.1';
            await prompt.submit();
        }
      });

      await enquirer.prompt(promptHandler.generatePrompts(versionlist));
    });

    it('should return a create option if selected', async () => {
      enquirer.on('prompt', async prompt => {
        await prompt.keypress(null, { name: 'down' });
        await prompt.keypress(null, { name: 'up' });
        await prompt.submit();
        await prompt.submit();
      });

      const answer = await enquirer.prompt(promptHandler.generatePrompts(versionlist));
      expect(answer.versionSelection).toBe('1');
    });
  });

  describe('createOasPrompt()', () => {
    it('should return a create option if selected', async () => {
      enquirer.on('prompt', async prompt => {
        await prompt.keypress(null, { name: 'down' });
        await prompt.submit();
      });
      const answer = await enquirer.prompt(promptHandler.createOasPrompt([{}], null, 1, null));

      expect(answer.option).toBe('create');
    });

    it('should return specId if user chooses to update file', async () => {
      jest.mock('enquirer');
      enquirer.on('prompt', async prompt => {
        await prompt.keypress(null, { name: 'down' });
        await prompt.keypress(null, { name: 'up' });
        await prompt.submit();
      });
      enquirer.prompt = jest.fn();
      enquirer.prompt.mockReturnValue('spec1');
      const parsedDocs = {
        next: {
          page: null,
        },
        prev: {
          page: null,
        },
      };
      const answer = await enquirer.prompt(promptHandler.createOasPrompt(specList, parsedDocs, 1, getSpecs));

      expect(answer).toBe('spec1');
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
      const answer = await enquirer.prompt(promptHandler.createVersionPrompt(versionlist, opts, false));
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
      const answer = await enquirer.prompt(promptHandler.createVersionPrompt(versionlist, opts, true));
      expect(answer.is_hidden).toBe(false);
      expect(answer.from).toBe('');
    });
  });
});
