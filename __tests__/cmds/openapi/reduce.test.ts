import fs from 'node:fs';

import prompts from 'prompts';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import OpenAPIReduceCommand from '../../../src/cmds/openapi/reduce.js';
import { gitDefaultMocks } from '../../helpers/get-git-mock.js';

const reducer = new OpenAPIReduceCommand();

const successfulReduction = () => 'Your reduced API definition has been saved to output.json! 🤏';

let consoleInfoSpy;

describe('rdme openapi:reduce', () => {
  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    gitDefaultMocks();
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();

    vi.clearAllMocks();
  });

  describe('reducing', () => {
    describe('by tag', () => {
      it.each([
        ['OpenAPI 3.0', 'json', '3.0'],
        ['OpenAPI 3.0', 'yaml', '3.0'],
        ['OpenAPI 3.1', 'json', '3.1'],
        ['OpenAPI 3.1', 'yaml', '3.1'],
      ])('should support reducing a %s definition (format: %s)', async (_, format, specVersion) => {
        const spec = require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`);

        let reducedSpec;
        fs.writeFileSync = vi.fn((fileName, data) => {
          reducedSpec = JSON.parse(data as string);
        });

        prompts.inject(['tags', ['pet'], 'output.json']);

        await expect(
          reducer.run({
            spec,
          }),
        ).resolves.toBe(successfulReduction());

        expect(fs.writeFileSync).toHaveBeenCalledWith('output.json', expect.any(String));
        expect(reducedSpec.tags).toHaveLength(1);
        expect(Object.keys(reducedSpec.paths)).toStrictEqual([
          '/pet',
          '/pet/findByStatus',
          '/pet/findByTags',
          '/pet/{petId}',
          '/pet/{petId}/uploadImage',
        ]);
      });
    });

    describe('by path', () => {
      it.each([
        ['OpenAPI 3.0', 'json', '3.0'],
        ['OpenAPI 3.0', 'yaml', '3.0'],
        ['OpenAPI 3.1', 'json', '3.1'],
        ['OpenAPI 3.1', 'yaml', '3.1'],
      ])('should support reducing a %s definition (format: %s)', async (_, format, specVersion) => {
        const spec = require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`);

        let reducedSpec;
        fs.writeFileSync = vi.fn((fileName, data) => {
          reducedSpec = JSON.parse(data as string);
        });

        prompts.inject(['paths', ['/pet', '/pet/findByStatus'], ['get', 'post'], 'output.json']);

        await expect(
          reducer.run({
            spec,
          }),
        ).resolves.toBe(successfulReduction());

        expect(fs.writeFileSync).toHaveBeenCalledWith('output.json', expect.any(String));
        expect(reducedSpec.tags).toHaveLength(1);
        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet', '/pet/findByStatus']);
        expect(Object.keys(reducedSpec.paths['/pet'])).toStrictEqual(['post']);
        expect(Object.keys(reducedSpec.paths['/pet/findByStatus'])).toStrictEqual(['get']);
      });
    });
  });

  describe('error handling', () => {
    it.each([['json'], ['yaml']])('should fail if given a Swagger 2.0 definition (format: %s)', async format => {
      const spec = require.resolve(`@readme/oas-examples/2.0/${format}/petstore.${format}`);

      await expect(
        reducer.run({
          spec,
        }),
      ).rejects.toStrictEqual(new Error('Sorry, this reducer feature in rdme only supports OpenAPI 3.0+ definitions.'));
    });

    it('should fail if you attempt to reduce a spec to nothing via tags', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      prompts.inject(['tags', ['unknown-tag'], 'output.json']);

      await expect(
        reducer.run({
          spec,
        }),
      ).rejects.toStrictEqual(
        new Error('All paths in the API definition were removed. Did you supply the right path name to reduce by?'),
      );
    });

    it('should fail if you attempt to reduce a spec to nothing via paths', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      prompts.inject(['paths', ['unknown-path'], 'output.json']);

      await expect(
        reducer.run({
          spec,
        }),
      ).rejects.toStrictEqual(
        new Error('All paths in the API definition were removed. Did you supply the right path name to reduce by?'),
      );
    });

    it('should fail if you attempt to pass both tags and paths as opts', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      await expect(
        reducer.run({
          spec,
          tag: ['tag1', 'tag2'],
          path: ['/path'],
        }),
      ).rejects.toStrictEqual(new Error('You can pass in either tags or paths/methods, but not both.'));
    });

    it('should fail if you attempt to pass both tags and methods as opts', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      await expect(
        reducer.run({
          spec,
          tag: ['tag1', 'tag2'],
          method: ['get'],
        }),
      ).rejects.toStrictEqual(new Error('You can pass in either tags or paths/methods, but not both.'));
    });

    it('should fail if you attempt to pass non-existent path and no method', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      await expect(
        reducer.run({
          spec,
          path: ['unknown-path'],
        }),
      ).rejects.toStrictEqual(
        new Error('All paths in the API definition were removed. Did you supply the right path name to reduce by?'),
      );
    });
  });
});
