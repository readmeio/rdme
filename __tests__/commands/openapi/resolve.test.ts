import fs from 'node:fs';

import prompts from 'prompts';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi, type MockInstance } from 'vitest';

import Command from '../../../src/commands/openapi/resolve.js';
import { runCommand, type OclifOutput } from '../../helpers/oclif.js';

describe('openapi resolve', () => {
  let fsWriteFileSyncSpy: MockInstance<typeof fs.writeFileSync>;
  let resolvedSpec: string;
  let run: (args?: string[]) => OclifOutput;
  let testWorkingDir: string;

  beforeAll(() => {
    run = runCommand(Command);
  });

  beforeEach(() => {
    testWorkingDir = process.cwd();

    fsWriteFileSyncSpy = vi.spyOn(fs, 'writeFileSync').mockImplementationOnce((filename, data) => {
      resolvedSpec = JSON.parse(data as string);
    });
  });

  afterEach(() => {
    process.chdir(testWorkingDir);
    vi.restoreAllMocks();
  });

  describe('resolving', () => {
    it.each([
      ['standard', 'circular-references.json'],
      ['recursive', 'recursive-reference.json'],
      ['recursive and nested circularity in a single file', 'combined-cases.json'],
      ['replace unprocessable circularity with empty objects', 'unresolvable-circular-references.json'],
      ['schema only contains $refs', 'circular-reference-ref-only.json'],
      ['schema only contains $refs with a `title`', 'circular-reference-ref-only-title.json'],
    ])('should support resolving circular references (case: %s)', async (_, specFile) => {
      const spec = require.resolve(`../../__fixtures__/circular-ref-oas/${specFile}`);
      const expectedOutput = require.resolve(
        `../../__fixtures__/circular-ref-oas/${specFile.replace('.json', '.resolved.json')}`,
      );

      prompts.inject(['output.json']);

      const result = await run([spec]);
      expect(result).toMatchSnapshot();

      expect(fsWriteFileSyncSpy).toHaveBeenCalledWith('output.json', expect.any(String));
      expect(resolvedSpec).toStrictEqual(JSON.parse(fs.readFileSync(expectedOutput, 'utf8')));
    });
  });

  describe('error handling', () => {
    it('should fail if supplied a file with no circular references', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      prompts.inject(['output.json']);

      const { error } = await run([spec]);
      expect(error).toStrictEqual(new Error('The file does not contain circular or recursive references.'));
    });

    it.each([['json'], ['yaml']])('should fail if given a Swagger 2.0 definition (format: %s)', async format => {
      const spec = require.resolve(`@readme/oas-examples/2.0/${format}/petstore.${format}`);

      await expect(run([spec])).resolves.toMatchObject({
        error: new Error('Sorry, this command only supports OpenAPI 3.0+ definitions.'),
      });
    });
  });
});
