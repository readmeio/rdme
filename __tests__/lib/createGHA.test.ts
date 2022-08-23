import type { Options as ValidateOptions } from '../../src/cmds/validate';
import type { CommandOptions } from '../../src/lib/baseCommand';

import fs from 'fs';

import prompts from 'prompts';

import ValidateCommand from '../../src/cmds/validate';
import createGHA from '../../src/lib/createGHA';

const validateCommand = new ValidateCommand();

describe('#createGHA', () => {
  beforeEach(() => {
    // global Date override to handle timestamp generation
    // stolen from here: https://github.com/facebook/jest/issues/2234#issuecomment-294873406
    const DATE_TO_USE = new Date('2022');
    // @ts-expect-error we're just overriding the constructor for tests,
    // no need to construct everything
    global.Date = jest.fn(() => DATE_TO_USE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should run GHA creation workflow', async () => {
      expect.assertions(3);
      const fileName = 'rdme-validate';
      prompts.inject([true, 'main', fileName]);

      let yamlOutput;

      fs.writeFileSync = jest.fn((f, d) => {
        yamlOutput = d;
        return true;
      });

      await expect(
        createGHA('', 'validate', validateCommand.args, { spec: 'petstore.json' } as CommandOptions<ValidateOptions>)
      ).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yaml`, expect.any(String));
    });

    it('should run GHA creation workflow with `--github` flag', async () => {
      expect.assertions(3);
      const fileName = 'rdme-validate-with-github-flag';
      prompts.inject(['main', fileName]);

      let yamlOutput;

      fs.writeFileSync = jest.fn((f, d) => {
        yamlOutput = d;
        return true;
      });

      await expect(
        createGHA('', 'validate', validateCommand.args, {
          github: true,
          spec: 'petstore.json',
        } as CommandOptions<ValidateOptions>)
      ).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yaml`, expect.any(String));
    });

    it('should exit if user does not want to set up GHA', async () => {
      prompts.inject([false]);

      return expect(
        createGHA('', 'validate', validateCommand.args, { spec: 'petstore.json' } as CommandOptions<ValidateOptions>)
      ).rejects.toStrictEqual(
        new Error(
          'GitHub Action Workflow cancelled. If you ever change your mind, you can run this command again with the `--github` flag.'
        )
      );
    });
  });
});
