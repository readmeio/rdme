/* eslint-disable no-console */

import fs from 'node:fs';

import chalk from 'chalk';
import prompts from 'prompts';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi, type MockInstance } from 'vitest';

import Command from '../../../src/commands/openapi/validate.js';
import { after, before } from '../../helpers/get-gha-setup.js';
import { runCommandAndReturnResult, runCommandWithHooks } from '../../helpers/oclif.js';

let consoleInfoSpy: MockInstance<typeof console.info>;

const getCommandOutput = () => {
  return [consoleInfoSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
};

describe('rdme openapi validate', () => {
  let run: (args?: string[]) => Promise<string>;
  let testWorkingDir: string;

  beforeAll(() => {
    run = runCommandAndReturnResult(Command);
  });

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    testWorkingDir = process.cwd();
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();

    process.chdir(testWorkingDir);
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
      run([require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`)]),
    ).resolves.toContain(
      `petstore.${format} is a valid ${specVersion === '2.0' ? 'Swagger' : 'OpenAPI'} API definition!`,
    );
  });

  it('should discover and upload an API definition if none is provided', async () => {
    await expect(run(['--workingDirectory', './__tests__/__fixtures__/relative-ref-oas'])).resolves.toBe(
      chalk.green('petstore.json is a valid OpenAPI API definition!'),
    );

    expect(console.info).toHaveBeenCalledTimes(1);

    const output = getCommandOutput();

    expect(output).toBe(chalk.yellow('ℹ️  We found petstore.json and are attempting to validate it.'));
  });

  it('should use specified working directory', () => {
    return expect(
      run(['petstore.json', '--workingDirectory', './__tests__/__fixtures__/relative-ref-oas']),
    ).resolves.toBe(chalk.green('petstore.json is a valid OpenAPI API definition!'));
  });

  it('should adhere to .gitignore in subdirectories', () => {
    fs.copyFileSync(
      require.resolve('@readme/oas-examples/3.0/json/petstore-simple.json'),
      './__tests__/__fixtures__/nested-gitignored-oas/nest/petstore-ignored.json',
    );

    return expect(run(['--workingDirectory', './__tests__/__fixtures__/nested-gitignored-oas'])).resolves.toBe(
      chalk.green('nest/petstore.json is a valid OpenAPI API definition!'),
    );
  });

  describe('error handling', () => {
    it('should throw an error if invalid JSON is supplied', () => {
      return expect(run(['./__tests__/__fixtures__/invalid-json/yikes.json'])).rejects.toStrictEqual(
        new SyntaxError('Unexpected end of JSON input'),
      );
    });

    it('should throw an error if an invalid OpenAPI 3.0 definition is supplied', () => {
      return expect(run(['./__tests__/__fixtures__/invalid-oas.json'])).rejects.toMatchSnapshot();
    });

    it('should throw an error if an invalid OpenAPI 3.1 definition is supplied', () => {
      return expect(run(['./__tests__/__fixtures__/invalid-oas-3.1.json'])).rejects.toMatchSnapshot();
    });

    it('should throw an error if an invalid Swagger definition is supplied', () => {
      return expect(run(['./__tests__/__fixtures__/invalid-swagger.json'])).rejects.toMatchSnapshot();
    });

    it('should throw an error if an invalid API definition has many errors', () => {
      return expect(run(['./__tests__/__fixtures__/very-invalid-oas.json'])).rejects.toMatchSnapshot();
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

      await expect(run([spec])).resolves.toBe(chalk.green(`${spec} is a valid OpenAPI API definition!`));
    });

    it('should fail if user attempts to pass `--github` flag in CI environment', async () => {
      return expect(
        (
          await runCommandWithHooks([
            'openapi validate',
            '__tests__/__fixtures__/petstore-simple-weird-version.json',
            '--github',
          ])
        ).error.message,
      ).toContain('The `--github` flag is only for usage in non-CI environments');
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

      await expect(run()).resolves.toMatchSnapshot();

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

      await expect(run([spec])).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));
    });

    it('should create GHA workflow if user passes in spec via opt (including workingDirectory)', async () => {
      expect.assertions(3);

      const spec = 'petstore.json';
      const fileName = 'validate-test-opt-spec-workdir-file';
      prompts.inject([true, 'validate-test-opt-spec-github-branch', fileName]);

      await expect(
        run([spec, '--workingDirectory', './__tests__/__fixtures__/relative-ref-oas']),
      ).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));
    });

    it('should create GHA workflow if user passes in spec via opt (github flag enabled)', async () => {
      expect.assertions(3);

      const spec = '__tests__/__fixtures__/petstore-simple-weird-version.json';
      const fileName = 'validate-test-opt-spec-github-file';
      prompts.inject(['validate-test-opt-spec-github-branch', fileName]);

      await expect(run([spec, '--github'])).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));
    });

    it('should reject if user says no to creating GHA workflow', () => {
      const spec = '__tests__/__fixtures__/petstore-simple-weird-version.json';
      prompts.inject([spec, false]);
      return expect(run()).rejects.toStrictEqual(
        new Error(
          'GitHub Actions workflow creation cancelled. If you ever change your mind, you can run this command again with the `--github` flag.',
        ),
      );
    });
  });
});
