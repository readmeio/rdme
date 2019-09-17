const assert = require('assert');
const Enquirer = require('enquirer');
const promptHandler = require('../../lib/prompts');

const versionlist = [
  {
    version: '1',
  },
  {
    version: '2',
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

        if (prompt.name === 'versionSelection') {
          assert.equal(await prompt.skip(), true);
        }

        if (prompt.name === 'newVersion') {
          // eslint-disable-next-line
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
      assert.equal(answer.versionSelection, '1');
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
          // eslint-disable-next-line
          prompt.value = '1.2.1';
          await prompt.submit();
        }
      });
      const answer = await enquirer.prompt(
        promptHandler.createVersionPrompt(versionlist, opts, false),
      );
      assert.equal(answer.is_hidden, false);
      assert.equal(answer.from, '1');
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
          // eslint-disable-next-line
          prompt.value = '1.2.1';
          await prompt.submit();
        }
        await prompt.submit();
        await prompt.submit();
        await prompt.submit();
      });
      const answer = await enquirer.prompt(
        promptHandler.createVersionPrompt(versionlist, opts, true),
      );
      assert.equal(answer.is_hidden, false);
      assert.equal(answer.from, '');
    });
  });
});
