import fs from 'fs';

import prompts from 'prompts';

import OpenAPIConvertCommand from '../../../src/cmds/openapi/convert';

const convert = new OpenAPIConvertCommand();

const successfulConversion = () => 'Your converted API definition has been saved to output.json!';

const testWorkingDir = process.cwd();

describe('rdme openapi:convert', () => {
  afterEach(() => {
    process.chdir(testWorkingDir);

    jest.clearAllMocks();
  });

  describe('converting', () => {
    it.each([
      ['Swagger 2.0', 'json', '2.0'],
      ['Swagger 2.0', 'yaml', '2.0'],
    ])('should support reducing a %s definition (format: %s)', async (_, format, specVersion) => {
      const spec = require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore-simple.${format}`);

      let reducedSpec;
      fs.writeFileSync = jest.fn((fileName, data) => {
        reducedSpec = JSON.parse(data as string);
      });

      prompts.inject(['output.json']);

      await expect(
        convert.run({
          spec,
        })
      ).resolves.toBe(successfulConversion());

      expect(fs.writeFileSync).toHaveBeenCalledWith('output.json', expect.any(String));
      expect(reducedSpec.tags).toHaveLength(1);
      expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet/{petId}']);
      expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get', 'post', 'delete']);
    });

    it('should convert with no prompts via opts', async () => {
      const spec = 'petstore-simple.json';

      let reducedSpec;
      fs.writeFileSync = jest.fn((fileName, data) => {
        reducedSpec = JSON.parse(data as string);
      });

      await expect(
        convert.run({
          spec,
          workingDirectory: require.resolve(`@readme/oas-examples/2.0/json/${spec}`).replace(spec, ''),
          out: 'output.json',
        })
      ).resolves.toBe(successfulConversion());

      expect(fs.writeFileSync).toHaveBeenCalledWith('output.json', expect.any(String));
      expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet/{petId}']);
      expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get', 'post', 'delete']);
    });
  });

  describe('error handling', () => {
    it.each([['json'], ['yaml']])('should fail if given an OpenAPI 3.0 definition (format: %s)', async format => {
      const spec = require.resolve(`@readme/oas-examples/3.0/${format}/petstore.${format}`);

      await expect(
        convert.run({
          spec,
        })
      ).rejects.toStrictEqual(
        new Error("Sorry, this API definition is already an OpenAPI definition and doesn't need to be converted.")
      );
    });
  });
});
