import type { OclifOutput } from '../../helpers/oclif.js';
import type { MockInstance } from 'vitest';

import fs from 'node:fs';

import prompts from 'prompts';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import Command from '../../../src/commands/openapi/resolve.js';
import * as analyzeOas from '../../../src/lib/analyzeOas.js';
import * as promptWrapper from '../../../src/lib/promptWrapper.js';
import { runCommand } from '../../helpers/oclif.js';

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
      const spec = `./test/__fixtures__/circular-ref-oas/${specFile}`;
      const expectedOutput = `./test/__fixtures__/circular-ref-oas/${specFile.replace('.json', '.resolved.json')}`;
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

    it('should fail if the definition has no component schemas', async () => {
      const spec = './test/__fixtures__/no-component-schemas.json';

      const { error } = await run([spec]);
      expect(error).toStrictEqual(new Error('The file does not contain component schemas.'));
    });

    it('should fail when a reported circular reference path is too short', async () => {
      vi.spyOn(analyzeOas, 'default').mockResolvedValue({
        general: {},
        openapi: {
          circularRefs: { present: true, locations: ['#/foo'] },
        },
      } as never);

      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');
      const { error } = await run([spec]);

      expect(error).toStrictEqual(new Error('Invalid reference path: #/foo'));
    });

    it('should fail when a reported circular reference points at a missing property', async () => {
      vi.spyOn(analyzeOas, 'default').mockResolvedValue({
        general: {},
        openapi: {
          circularRefs: { present: true, locations: ['#/components/schemas/Pet/properties/not-a-real-prop'] },
        },
      } as never);

      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');
      const { error } = await run([spec]);

      expect(error).toStrictEqual(new Error('Property "not-a-real-prop" is not found or schema is invalid.'));
    });

    it('should fail when remaining circular references cannot be replaced', async () => {
      vi.spyOn(analyzeOas, 'default').mockResolvedValue({
        general: {},
        openapi: {
          circularRefs: { present: true, locations: ['#/components/schemas/Pet/properties/id'] },
        },
      } as never);

      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');
      const { error } = await run([spec]);

      expect(error).toStrictEqual(
        new Error('Unable to resolve all circular references, even with fallback replacements.'),
      );
    });

    it('should fail when creating a proxy schema from an unsupported schema type', async () => {
      vi.spyOn(analyzeOas, 'default').mockResolvedValue({
        general: {},
        openapi: {
          circularRefs: { present: true, locations: ['#/components/schemas/Pet/properties/name'] },
        },
      } as never);

      const { error } = await run(['./test/__fixtures__/resolve-schema-edges.json']);

      expect(error).toStrictEqual(new Error('Unsupported schema type detected in: Name'));
    });

    it('should skip creating a second proxy schema for array items that already include Ref', async () => {
      let calls = 0;
      vi.spyOn(analyzeOas, 'default').mockImplementation(() => {
        calls += 1;
        return Promise.resolve({
          general: {},
          openapi: {
            circularRefs: {
              present: calls === 1,
              locations: calls === 1 ? ['#/components/schemas/Holder/properties/items/items'] : [],
            },
          },
        } as never);
      });

      prompts.inject(['output.json']);
      const { error } = await run(['./test/__fixtures__/resolve-schema-edges.json']);

      expect(error).toBeUndefined();
      expect(fsWriteFileSyncSpy).toHaveBeenCalledWith('output.json', expect.any(String));
    });

    it('should replace leftover array and $ref schemas, then fail on an invalid leftover schema', async () => {
      let calls = 0;
      vi.spyOn(analyzeOas, 'default').mockImplementation(() => {
        calls += 1;
        let locations = ['#/components/schemas/Pet/properties/id'];
        if (calls === 12) locations = ['#/components/schemas/Tags/properties/ignored'];
        if (calls === 13) locations = ['#/components/schemas/Alias/properties/ignored'];
        if (calls >= 14) locations = ['#/components/schemas/Name/properties/ignored'];
        return Promise.resolve({
          general: {},
          openapi: {
            circularRefs: { present: true, locations },
          },
        } as never);
      });

      const { error } = await run(['./test/__fixtures__/resolve-schema-edges.json']);

      expect(error).toStrictEqual(new Error('Invalid schema format: {"type":"string"}'));
    });

    it('should fail object replacement when a leftover circular path is too short', async () => {
      let calls = 0;
      vi.spyOn(analyzeOas, 'default').mockImplementation(() => {
        calls += 1;
        return Promise.resolve({
          general: {},
          openapi: {
            circularRefs: {
              present: true,
              locations: calls <= 11 ? ['#/components/schemas/Pet/properties/id'] : ['#/foo'],
            },
          },
        } as never);
      });

      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');
      const { error } = await run([spec]);

      expect(error).toStrictEqual(new Error('Invalid reference path: #/foo'));
    });

    it('should use the spec filename when prompting for an output path', async () => {
      vi.spyOn(promptWrapper, 'default').mockImplementation(questions => {
        const question = Array.isArray(questions) ? questions[0] : questions;
        const initial = typeof question.initial === 'function' ? question.initial() : question.initial;
        return Promise.resolve({ outputPath: initial });
      });

      const spec = './test/__fixtures__/circular-ref-oas/circular-references.json';
      const { error } = await run([spec]);

      expect(error).toBeUndefined();
      expect(fsWriteFileSyncSpy).toHaveBeenCalledWith('circular-references.openapi.json', expect.any(String));
    });

    it('should warn and then fail when leftover circular refs point at a missing schema', async () => {
      let calls = 0;
      vi.spyOn(analyzeOas, 'default').mockImplementation(() => {
        calls += 1;
        const locations =
          calls <= 11 ? ['#/components/schemas/Pet/properties/id'] : ['#/components/schemas/Ghost/properties/missing'];
        return Promise.resolve({
          general: {},
          openapi: {
            circularRefs: { present: true, locations },
          },
        } as never);
      });

      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');
      const { error, stderr } = await run([spec]);

      expect(stderr).toContain('Schema not found for: Ghost');
      expect(error).toStrictEqual(
        new Error('Unable to resolve all circular references, even with fallback replacements.'),
      );
    });
  });
});
