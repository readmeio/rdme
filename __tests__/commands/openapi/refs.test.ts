import fs from 'node:fs';
import path from 'node:path';

import prompts from 'prompts';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi } from 'vitest';

import Command from '../../../src/commands/openapi/refs.js';
import { runCommandAndReturnResult } from '../../helpers/oclif.js';

describe('openapi refs', () => {
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    run = runCommandAndReturnResult(Command);
  });

  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('comparison of OpenAPI files', () => {
    it('should process circular references', async () => {
      const inputFile = path.resolve('__tests__/__fixtures__/circular-ref-oas/circular-references.json');
      const expectedOutputFile = path.resolve(
        '__tests__/__fixtures__/circular-ref-oas/circular-references-resolved.json',
      );
      const defaultOutputFilePath = 'circular-references.openapi.json';

      prompts.inject([defaultOutputFilePath]);

      let processedOutput;
      fs.writeFileSync = vi.fn((fileName, data) => {
        processedOutput = JSON.parse(data as string);
      });

      const result = await run([inputFile]);

      expect(result).toMatch(`Your API definition has been processed and saved to ${defaultOutputFilePath}!`);

      expect(fs.writeFileSync).toHaveBeenCalledWith(defaultOutputFilePath, expect.any(String));

      const expectedOutput = JSON.parse(fs.readFileSync(expectedOutputFile, 'utf8'));
      expect(processedOutput).toStrictEqual(expectedOutput);
    });

    it('should process recursive references', async () => {
      const inputFile = path.resolve('__tests__/__fixtures__/circular-ref-oas/recursive-reference.json');
      const expectedOutputFile = path.resolve(
        '__tests__/__fixtures__/circular-ref-oas/recursive-reference-resolved.json',
      );
      const defaultOutputFilePath = 'recursive-reference.openapi.json';

      prompts.inject([defaultOutputFilePath]);

      let processedOutput;
      fs.writeFileSync = vi.fn((fileName, data) => {
        processedOutput = JSON.parse(data as string);
      });

      const result = await run([inputFile]);

      expect(result).toMatch(`Your API definition has been processed and saved to ${defaultOutputFilePath}!`);

      expect(fs.writeFileSync).toHaveBeenCalledWith(defaultOutputFilePath, expect.any(String));

      const expectedOutput = JSON.parse(fs.readFileSync(expectedOutputFile, 'utf8'));
      expect(processedOutput).toStrictEqual(expectedOutput);
    });

    it('should replace circularity that cannot be processed with empty objects', async () => {
      const inputFile = path.resolve(
        '__tests__/__fixtures__/circular-ref-oas/unresolvable-circular-references.json',
      );
      const expectedOutputFile = path.resolve(
        '__tests__/__fixtures__/circular-ref-oas/unresolvable-circular-reference-resolved.json',
      );
      const defaultOutputFilePath = 'unresolvable-circular-references.openapi.json';

      prompts.inject([defaultOutputFilePath]);

      let processedOutput;
      fs.writeFileSync = vi.fn((fileName, data) => {
        processedOutput = JSON.parse(data as string);
      });

      const result = await run([inputFile]);

      expect(result).toMatch(`Your API definition has been processed and saved to ${defaultOutputFilePath}!`);

      expect(fs.writeFileSync).toHaveBeenCalledWith(defaultOutputFilePath, expect.any(String));

      const expectedOutput = JSON.parse(fs.readFileSync(expectedOutputFile, 'utf8'));
      expect(processedOutput).toStrictEqual(expectedOutput);
    });

    it('should process circular references if the schema contains only $ref', async () => {
      const inputFile = path.resolve('__tests__/__fixtures__/circular-ref-oas/circular-reference-ref-only.json');
      const expectedOutputFile = path.resolve(
        '__tests__/__fixtures__/circular-ref-oas/circular-reference-ref-only-resolved.json',
      );
      const defaultOutputFilePath = 'circular-reference-ref-only.openapi.json';

      prompts.inject([defaultOutputFilePath]);

      let processedOutput;
      fs.writeFileSync = vi.fn((fileName, data) => {
        processedOutput = JSON.parse(data as string);
      });

      const result = await run([inputFile]);

      expect(result).toMatch(`Your API definition has been processed and saved to ${defaultOutputFilePath}!`);

      expect(fs.writeFileSync).toHaveBeenCalledWith(defaultOutputFilePath, expect.any(String));

      const expectedOutput = JSON.parse(fs.readFileSync(expectedOutputFile, 'utf8'));
      expect(processedOutput).toStrictEqual(expectedOutput);
    });

    it('should process circular references if the schema contains only $ref with the title', async () => {
      const inputFile = path.resolve(
        '__tests__/__fixtures__/circular-ref-oas/circular-reference-ref-only-title.json',
      );
      const expectedOutputFile = path.resolve(
        '__tests__/__fixtures__/circular-ref-oas/circular-reference-ref-only-title-resolved.json',
      );
      const defaultOutputFilePath = 'circular-reference-ref-only.openapi.json';

      prompts.inject([defaultOutputFilePath]);

      let processedOutput;
      fs.writeFileSync = vi.fn((fileName, data) => {
        processedOutput = JSON.parse(data as string);
      });

      const result = await run([inputFile]);

      expect(result).toMatch(`Your API definition has been processed and saved to ${defaultOutputFilePath}!`);

      expect(fs.writeFileSync).toHaveBeenCalledWith(defaultOutputFilePath, expect.any(String));

      const expectedOutput = JSON.parse(fs.readFileSync(expectedOutputFile, 'utf8'));
      expect(processedOutput).toStrictEqual(expectedOutput);
    });

    it('should handle a combination of recursiveness/nested circularity within a single file', async () => {
      const inputFile = path.resolve('__tests__/__fixtures__/circular-ref-oas/combined-cases.json');
      const expectedOutputFile = path.resolve(
        '__tests__/__fixtures__/circular-ref-oas/combined-cases-resolved.json',
      );
      const defaultOutputFilePath = 'combined-cases.openapi.json';

      prompts.inject([defaultOutputFilePath]);

      let processedOutput;
      fs.writeFileSync = vi.fn((fileName, data) => {
        processedOutput = JSON.parse(data as string);
      });

      const result = await run([inputFile]);

      expect(result).toMatch(`Your API definition has been processed and saved to ${defaultOutputFilePath}!`);

      expect(fs.writeFileSync).toHaveBeenCalledWith(defaultOutputFilePath, expect.any(String));

      const expectedOutput = JSON.parse(fs.readFileSync(expectedOutputFile, 'utf8'));
      expect(processedOutput).toStrictEqual(expectedOutput);
    });
  });

  describe('error handling', () => {
    it.each([['json'], ['yaml']])('should fail if given a Swagger 2.0 definition (format: %s)', async format => {
      const spec = require.resolve(`@readme/oas-examples/2.0/${format}/petstore.${format}`);

      await expect(run([spec])).rejects.toStrictEqual(
        new Error('Sorry, this ref resolver feature in rdme only supports OpenAPI 3.0+ definitions.'),
      );
    });
  });
});
