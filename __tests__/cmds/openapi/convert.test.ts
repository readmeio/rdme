import fs from 'node:fs';

import prompts from 'prompts';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';

import Command from '../../../src/cmds/openapi/convert.js';
import { runCommand } from '../../helpers/setup-oclif-config.js';

const successfulConversion = () => 'Your API definition has been converted and bundled and saved to output.json!';

describe('rdme openapi:convert', () => {
  let run: (args?: string[]) => Promise<string>;
  let testWorkingDir: string;

  beforeAll(() => {
    run = runCommand(Command);
  });

  beforeEach(() => {
    testWorkingDir = process.cwd();
  });

  afterEach(() => {
    process.chdir(testWorkingDir);

    vi.clearAllMocks();
  });

  describe('converting', () => {
    it.each([
      ['Swagger 2.0', 'json', '2.0'],
      ['Swagger 2.0', 'yaml', '2.0'],
    ])('should support reducing a %s definition (format: %s)', async (_, format, specVersion) => {
      const spec = require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore-simple.${format}`);

      let reducedSpec;
      fs.writeFileSync = vi.fn((fileName, data) => {
        reducedSpec = JSON.parse(data as string);
      });

      prompts.inject(['output.json']);

      await expect(run([spec])).resolves.toBe(successfulConversion());

      expect(fs.writeFileSync).toHaveBeenCalledWith('output.json', expect.any(String));
      expect(reducedSpec.tags).toHaveLength(1);
      expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet/{petId}']);
      expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get', 'post', 'delete']);
    });
  });

  it('should convert with no prompts via opts', async () => {
    const spec = 'petstore-simple.json';

    let reducedSpec;
    fs.writeFileSync = vi.fn((fileName, data) => {
      reducedSpec = JSON.parse(data as string);
    });

    await expect(
      run([
        spec,
        '--workingDirectory',
        require.resolve(`@readme/oas-examples/2.0/json/${spec}`).replace(spec, ''),
        '--out',
        'output.json',
      ]),
    ).resolves.toBe(successfulConversion());

    expect(fs.writeFileSync).toHaveBeenCalledWith('output.json', expect.any(String));
    expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet/{petId}']);
    expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get', 'post', 'delete']);
  });

  describe('error handling', () => {
    it.each([['json'], ['yaml']])('should fail if given an OpenAPI 3.0 definition (format: %s)', async format => {
      const spec = require.resolve(`@readme/oas-examples/3.0/${format}/petstore.${format}`);

      let reducedSpec;
      fs.writeFileSync = vi.fn((fileName, data) => {
        reducedSpec = JSON.parse(data as string);
      });

      prompts.inject(['output.json']);

      await expect(run([spec])).resolves.toBe(successfulConversion());

      expect(fs.writeFileSync).toHaveBeenCalledWith('output.json', expect.any(String));
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
