import fs from 'node:fs';

import prompts from 'prompts';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi } from 'vitest';

import Command from '../../../src/commands/openapi/validate.js';
import { after, before } from '../../helpers/get-gha-setup.js';
import { runCommand, runCommandWithHooks, type OclifOutput } from '../../helpers/oclif.js';

describe('rdme openapi validate', () => {
  let run: (args?: string[]) => OclifOutput;
  let testWorkingDir: string;

  beforeAll(() => {
    run = runCommand(Command);
  });

  beforeEach(() => {
    testWorkingDir = process.cwd();
  });

  afterEach(() => {
    process.chdir(testWorkingDir);
  });

  it.each([
    ['Swagger 2.0', 'json', '2.0'],
    ['Swagger 2.0', 'yaml', '2.0'],
    ['OpenAPI 3.0', 'json', '3.0'],
    ['OpenAPI 3.0', 'yaml', '3.0'],
    ['OpenAPI 3.1', 'json', '3.1'],
    ['OpenAPI 3.1', 'yaml', '3.1'],
  ])('should support validating a %s definition (format: %s)', async (_, format, specVersion) => {
    expect(
      (await run([require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`)])).result,
    ).toContain(`petstore.${format} is a valid ${specVersion === '2.0' ? 'Swagger' : 'OpenAPI'} API definition!`);
  });

  it('should discover and upload an API definition if none is provided', async () => {
    const result = await run(['--workingDirectory', './__tests__/__fixtures__/relative-ref-oas']);
    expect(result).toMatchSnapshot();
  });

  it('should use specified working directory', async () => {
    const result = await run(['petstore.json', '--workingDirectory', './__tests__/__fixtures__/relative-ref-oas']);
    expect(result).toMatchSnapshot();
  });

  it('should adhere to .gitignore in subdirectories', async () => {
    fs.copyFileSync(
      require.resolve('@readme/oas-examples/3.0/json/petstore-simple.json'),
      './__tests__/__fixtures__/nested-gitignored-oas/nest/petstore-ignored.json',
    );

    const result = await run(['--workingDirectory', './__tests__/__fixtures__/nested-gitignored-oas']);
    expect(result).toMatchSnapshot();
  });

  describe('error handling', () => {
    it('should throw an error if invalid JSON is supplied', () => {
      return expect(run(['./__tests__/__fixtures__/invalid-json/yikes.json'])).resolves.toMatchSnapshot();
    });

    it('should throw an error if an invalid OpenAPI 3.0 definition is supplied', () => {
      return expect(run(['./__tests__/__fixtures__/invalid-oas.json'])).resolves.toMatchSnapshot();
    });

    it('should throw an error if an invalid OpenAPI 3.1 definition is supplied', () => {
      return expect(run(['./__tests__/__fixtures__/invalid-oas-3.1.json'])).resolves.toMatchSnapshot();
    });

    it('should throw an error if an invalid Swagger definition is supplied', () => {
      return expect(run(['./__tests__/__fixtures__/invalid-swagger.json'])).resolves.toMatchSnapshot();
    });

    it('should throw an error if an invalid API definition has many errors', () => {
      return expect(run(['./__tests__/__fixtures__/very-invalid-oas.json'])).resolves.toMatchSnapshot();
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

      await expect(run([spec])).resolves.toMatchSnapshot();
    });

    it('should fail if user attempts to pass `--github` flag in CI environment', async () => {
      return expect(
        (
          await runCommandWithHooks([
            'openapi validate',
            '__tests__/__fixtures__/petstore-simple-weird-version.json',
            '--github',
          ])
        ).error,
      ).toMatchSnapshot();
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
      const spec = '__tests__/__fixtures__/petstore-simple-weird-version.json';
      const fileName = 'validate-test-file';
      prompts.inject([spec, true, 'validate-test-branch', fileName]);

      await expect(run()).resolves.toMatchSnapshot();
      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));
    });

    it('should create GHA workflow if user passes in spec via opt', async () => {
      const spec = '__tests__/__fixtures__/petstore-simple-weird-version.json';
      const fileName = 'validate-test-opt-spec-file';
      prompts.inject([true, 'validate-test-opt-spec-branch', fileName]);

      await expect(run([spec])).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));
    });

    it('should create GHA workflow if user passes in spec via opt (including workingDirectory)', async () => {
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
      return expect(run()).resolves.toMatchSnapshot();
    });
  });
});
