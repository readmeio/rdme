import type { OASDocument } from 'oas/types';

import fs from 'node:fs';

import prompts from 'prompts';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach, type MockInstance } from 'vitest';

import Command from '../../../src/commands/openapi/convert.js';
import { runCommand, type OclifOutput } from '../../helpers/oclif.js';

const successfulConversion = () => 'Your API definition has been converted and bundled and saved to output.json!';

describe('rdme openapi convert', () => {
  let fsWriteFileSyncSpy: MockInstance<typeof fs.writeFileSync>;
  let reducedSpec: OASDocument;
  let run: (args?: string[]) => OclifOutput;
  let testWorkingDir: string;

  beforeAll(() => {
    run = runCommand(Command);
  });

  beforeEach(() => {
    testWorkingDir = process.cwd();

    fsWriteFileSyncSpy = vi.spyOn(fs, 'writeFileSync').mockImplementationOnce((filename, data) => {
      reducedSpec = JSON.parse(data as string);
    });
  });

  afterEach(() => {
    process.chdir(testWorkingDir);
    vi.restoreAllMocks();
  });

  describe('converting', () => {
    it.each([
      ['Swagger 2.0', 'json', '2.0'],
      ['Swagger 2.0', 'yaml', '2.0'],
    ])('should support reducing a %s definition (format: %s)', async (_, format, specVersion) => {
      const spec = require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore-simple.${format}`);

      prompts.inject(['output.json']);

      expect((await run([spec])).result).toBe(successfulConversion());

      expect(fsWriteFileSyncSpy).toHaveBeenCalledWith('output.json', expect.any(String));
      expect(reducedSpec.tags).toHaveLength(1);
      expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet/{petId}']);
      expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get', 'post', 'delete']);
    });
  });

  it('should convert with no prompts via opts', async () => {
    const spec = 'petstore-simple.json';

    await expect(
      run([
        spec,
        '--workingDirectory',
        require.resolve(`@readme/oas-examples/2.0/json/${spec}`).replace(spec, ''),
        '--out',
        'output.json',
      ]),
    ).resolves.toMatchInlineSnapshot(`
      {
        "result": "Your API definition has been converted and bundled and saved to output.json!",
        "stderr": "- Validating the API definition located at petstore-simple.json...
      ",
        "stdout": "",
      }
    `);

    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith('output.json', expect.any(String));
    expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet/{petId}']);
    expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get', 'post', 'delete']);
  });

  describe('error handling', () => {
    it.each([['json'], ['yaml']])('should warn if given an OpenAPI 3.0 definition (format: %s)', async format => {
      const spec = `petstore.${format}`;

      prompts.inject(['output.json']);

      await expect(
        run([
          spec,
          '--workingDirectory',
          require.resolve(`@readme/oas-examples/3.0/${format}/${spec}`).replace(spec, ''),
        ]),
      ).resolves.toMatchSnapshot();

      expect(fsWriteFileSyncSpy).toHaveBeenCalledWith('output.json', expect.any(String));
      expect(reducedSpec.tags).toHaveLength(3);
      expect(Object.keys(reducedSpec.paths)).toStrictEqual([
        '/pet',
        '/pet/findByStatus',
        '/pet/findByTags',
        '/pet/{petId}',
        '/pet/{petId}/uploadImage',
        '/store/inventory',
        '/store/order',
        '/store/order/{orderId}',
        '/user',
        '/user/createWithArray',
        '/user/createWithList',
        '/user/login',
        '/user/logout',
        '/user/{username}',
      ]);
      expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get', 'post', 'delete']);
    });
  });
});
