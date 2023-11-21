import fs from 'node:fs';

import prompts from 'prompts';
import { describe, it, expect, vi } from 'vitest';

import OpenAPIConvertCommand from '../../../src/cmds/openapi/convert.js';

const convert = new OpenAPIConvertCommand();

const successfulConversion = () => 'Your API definition has been converted and bundled and saved to output.json!';

describe('rdme openapi:convert', () => {
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

      await expect(
        convert.run({
          spec,
        }),
      ).resolves.toBe(successfulConversion());

      expect(fs.writeFileSync).toHaveBeenCalledWith('output.json', expect.any(String));
      expect(reducedSpec.tags).toHaveLength(1);
      expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet/{petId}']);
      expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get', 'post', 'delete']);
    });
  });

  describe('error handling', () => {
    it.each([['json'], ['yaml']])('should fail if given an OpenAPI 3.0 definition (format: %s)', async format => {
      const spec = require.resolve(`@readme/oas-examples/3.0/${format}/petstore.${format}`);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      let reducedSpec;
      fs.writeFileSync = vi.fn((fileName, data) => {
        reducedSpec = JSON.parse(data as string);
      });

      prompts.inject(['output.json']);

      await expect(
        convert.run({
          spec,
        }),
      ).resolves.toBe(successfulConversion());

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
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '⚠️  Warning! The input file is already OpenAPI, so no conversion is necessary. Any external references will be bundled.',
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
