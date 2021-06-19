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

describe('prompt test bed', () => {
  let enquirer;

  beforeEach(() => {
    enquirer = new Enquirer({ show: false });
  });

  describe('generatePrompts()', () => {
    it('should not allow selection of version if chosen to create new version', async () => {
      enquirer.on('prompt', async prompt => {
        if (prompt.name === 'option') {
          await prompt.keypress(null, { name: 'down' });
          await prompt.submit();
        }

        // eslint-disable-next-line jest/no-if
        if (prompt.name === 'versionSelection') {
          expect(await prompt.skip()).toBe(true);
        }

        if (prompt.name === 'newVersion') {
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
      const answer = await enquirer.prompt(promptHandler.createOasPrompt([{}]));

      expect(answer.option).toBe('create');
      expect(answer.specId).toBe('');
    });

    it('should return specId if user chooses to update file', async () => {
      enquirer.on('prompt', async prompt => {
        await prompt.keypress(null, { name: 'down' });
        await prompt.keypress(null, { name: 'up' });
        await prompt.submit();
        await prompt.submit();
      });
      const answer = await enquirer.prompt(promptHandler.createOasPrompt(specList));

      expect(answer.option).toBe('update');
      expect(answer.specId).toBe('spec1');
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
