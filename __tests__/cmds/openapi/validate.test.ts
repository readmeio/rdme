/* eslint-disable no-console */
import fs from 'node:fs';

import chalk from 'chalk';
import prompts from 'prompts';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import OpenAPIValidateCommand from '../../../src/cmds/openapi/validate.js';
import ValidateAliasCommand from '../../../src/cmds/validate.js';
import { after, before } from '../../helpers/get-gha-setup.js';
import { gitDefaultMocks } from '../../helpers/get-git-mock.js';

const validate = new OpenAPIValidateCommand();
const validateAlias = new ValidateAliasCommand();

let consoleSpy;

const getCommandOutput = () => {
  return [consoleSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
};

describe('rdme openapi:validate', () => {
  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('', () => {
    beforeEach(() => {
      gitDefaultMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it.each([
      ['Swagger 2.0', 'json', '2.0'],
      ['Swagger 2.0', 'yaml', '2.0'],
      ['OpenAPI 3.0', 'json', '3.0'],
      ['OpenAPI 3.0', 'yaml', '3.0'],
      ['OpenAPI 3.1', 'json', '3.1'],
      ['OpenAPI 3.1', 'yaml', '3.1'],
    ])('should support validating a %s definition (format: %s)', (_, format, specVersion) => {
      expect(console.info).toHaveBeenCalledTimes(0);
      return expect(
        validate.run({
          spec: require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`),
        }),
      ).resolves.toContain(
        `petstore.${format} is a valid ${specVersion === '2.0' ? 'Swagger' : 'OpenAPI'} API definition!`,
      );
    });
  });

  describe('error handling', () => {
    it('should throw an error if invalid JSON is supplied', () => {
      return expect(validate.run({ spec: './__tests__/__fixtures__/invalid-json/yikes.json' })).rejects.toStrictEqual(
        new SyntaxError('Unexpected end of JSON input'),
      );
    });

    it('should throw an error if an invalid OpenAPI 3.0 definition is supplied', () => {
      return expect(validate.run({ spec: './__tests__/__fixtures__/invalid-oas.json' })).rejects.toThrow(
        'Token "Error" does not exist.',
      );
    });

    it('should throw an error if an invalid OpenAPI 3.1 definition is supplied', () => {
      return expect(validate.run({ spec: './__tests__/__fixtures__/invalid-oas-3.1.json' })).rejects.toMatchSnapshot();
    });

    it('should throw an error if an invalid Swagger definition is supplied', () => {
      return expect(validate.run({ spec: './__tests__/__fixtures__/invalid-swagger.json' })).rejects.toMatchSnapshot();
    });

    it('should throw an error if an invalid API definition has many errors', () => {
      return expect(validate.run({ spec: './__tests__/__fixtures__/very-invalid-oas.json' })).rejects.toMatchSnapshot();
    });
  });

  describe('CI tests', () => {
    beforeEach(() => {
      vi.stubEnv('TEST_RDME_CI', 'true');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should successfully validate prompt and not run GHA onboarding', async () => {
      vi.stubEnv('TEST_RDME_CREATEGHA', 'true');
      const spec = '__tests__/__fixtures__/petstore-simple-weird-version.json';
      await expect(validate.run({ spec })).resolves.toBe(chalk.green(`${spec} is a valid OpenAPI API definition!`));
    });

    it('should fail if user attempts to pass `--github` flag in CI environment', () => {
      return expect(
        validate.run({ github: true, spec: '__tests__/__fixtures__/petstore-simple-weird-version.json' }),
      ).rejects.toStrictEqual(new Error('The `--github` flag is only for usage in non-CI environments.'));
    });
  });

  describe('GHA onboarding E2E tests', () => {
    let yamlOutput;

    beforeEach(() => {
      before((fileName, data) => {
        yamlOutput = data;
      });
    });

    afterEach(() => {
      after();
    });

    it('should create GHA workflow if user passes in spec via prompts', async () => {
      expect.assertions(6);
      const spec = '__tests__/__fixtures__/petstore-simple-weird-version.json';
      const fileName = 'validate-test-file';
      prompts.inject([spec, true, 'validate-test-branch', fileName]);

      await expect(validate.run({})).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));
      expect(console.info).toHaveBeenCalledTimes(2);
      const output = getCommandOutput();
      expect(output).toMatch("Looks like you're running this command in a GitHub Repository!");
      expect(output).toMatch('is a valid OpenAPI API definition!');
    });

    it('should create GHA workflow if user passes in spec via opt', async () => {
      expect.assertions(3);
      const spec = '__tests__/__fixtures__/petstore-simple-weird-version.json';
      const fileName = 'validate-test-opt-spec-file';
      prompts.inject([true, 'validate-test-opt-spec-branch', fileName]);

      await expect(validate.run({ spec })).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));
    });

    it('should create GHA workflow if user passes in spec via opt (github flag enabled)', async () => {
      expect.assertions(3);
      const spec = '__tests__/__fixtures__/petstore-simple-weird-version.json';
      const fileName = 'validate-test-opt-spec-github-file';
      prompts.inject(['validate-test-opt-spec-github-branch', fileName]);

      await expect(validate.run({ spec, github: true })).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));
    });

    it('should reject if user says no to creating GHA workflow', () => {
      const spec = '__tests__/__fixtures__/petstore-simple-weird-version.json';
      prompts.inject([spec, false]);
      return expect(validate.run({})).rejects.toStrictEqual(
        new Error(
          'GitHub Actions workflow creation cancelled. If you ever change your mind, you can run this command again with the `--github` flag.',
        ),
      );
    });
  });
});

describe('rdme validate', () => {
  let consoleWarnSpy;

  const getWarningCommandOutput = () => {
    return [consoleWarnSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
  };

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should should `rdme openapi:validate`', async () => {
    await expect(
      validateAlias.run({
        spec: require.resolve('@readme/oas-examples/3.0/json/petstore.json'),
      }),
    ).resolves.toContain(chalk.green('petstore.json is a valid OpenAPI API definition!'));

    expect(console.warn).toHaveBeenCalledTimes(1);

    const output = getWarningCommandOutput();
    expect(output).toBe(
      chalk.yellow('⚠️  Warning! `rdme validate` has been deprecated. Please use `rdme openapi:validate` instead.'),
    );
  });
});
