import type { OASDocument } from 'oas/types';

import fs from 'node:fs';

import prompts from 'prompts';
import { afterEach, beforeAll, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import Command from '../../../src/commands/openapi/reduce.js';
import { type OclifOutput, runCommand } from '../../helpers/oclif.js';

describe('rdme openapi reduce', () => {
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

  describe('reducing', () => {
    describe('by tag', () => {
      it.each([
        ['OpenAPI 3.0', 'json', '3.0'],
        ['OpenAPI 3.0', 'yaml', '3.0'],
        ['OpenAPI 3.1', 'json', '3.1'],
        ['OpenAPI 3.1', 'yaml', '3.1'],
      ])('should support reducing a %s definition (format: %s)', async (_, format, specVersion) => {
        const spec = require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`);

        prompts.inject(['tags', ['pet'], 'output.json']);

        const { result } = await run([spec]);
        expect(result).toBe('Your reduced API definition has been saved to output.json! 🤏');

        expect(fsWriteFileSyncSpy).toHaveBeenCalledWith('output.json', expect.any(String));
        expect(reducedSpec.tags).toHaveLength(1);
        expect(Object.keys(reducedSpec.paths)).toStrictEqual([
          '/pet',
          '/pet/findByStatus',
          '/pet/findByTags',
          '/pet/{petId}',
          '/pet/{petId}/uploadImage',
        ]);
      });

      it('should discover and upload an API definition if none is provided', async () => {
        prompts.inject(['tags', ['user'], 'output.json']);

        await expect(
          run(['--workingDirectory', './__tests__/__fixtures__/relative-ref-oas']),
        ).resolves.toMatchSnapshot();

        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/user']);
      });

      it('should reduce with no prompts via opts', async () => {
        await expect(
          run([
            '--workingDirectory',
            './__tests__/__fixtures__/relative-ref-oas',
            '--tag',
            'user',
            '--out',
            'output.json',
          ]),
        ).resolves.toMatchSnapshot();

        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/user']);
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

        prompts.inject(['paths', ['/pet', '/pet/findByStatus'], ['get', 'post'], 'output.json']);

        const { result } = await run([spec]);
        expect(result).toBe('Your reduced API definition has been saved to output.json! 🤏');

        expect(fsWriteFileSyncSpy).toHaveBeenCalledWith('output.json', expect.any(String));
        expect(reducedSpec.tags).toHaveLength(1);
        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet', '/pet/findByStatus']);
        expect(Object.keys(reducedSpec.paths['/pet'])).toStrictEqual(['post']);
        expect(Object.keys(reducedSpec.paths['/pet/findByStatus'])).toStrictEqual(['get']);
      });

      it('should reduce with no prompts via opts', async () => {
        await expect(
          run([
            '--workingDirectory',
            './__tests__/__fixtures__/relative-ref-oas',
            '--path',
            '/pet',
            '--path',
            '/pet/{petId}',
            '--method',
            'get',
            '--method',
            'post',
            '--out',
            'output.json',
          ]),
        ).resolves.toMatchSnapshot();

        expect(fsWriteFileSyncSpy).toHaveBeenCalledWith('output.json', expect.any(String));
        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet', '/pet/{petId}']);
        expect(Object.keys(reducedSpec.paths['/pet'])).toStrictEqual(['post']);
        expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get']);
      });

      it('should reduce and update title with no prompts via opts', async () => {
        const title = 'some alternative title';

        await expect(
          run([
            '--workingDirectory',
            './__tests__/__fixtures__/relative-ref-oas',
            '--path',
            '/pet',
            '--path',
            '/pet/{petId}',
            '--method',
            'get',
            '--method',
            'post',
            '--title',
            title,
            '--out',
            'output.json',
          ]),
        ).resolves.toMatchSnapshot();

        expect(fsWriteFileSyncSpy).toHaveBeenCalledWith('output.json', expect.any(String));
        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet', '/pet/{petId}']);
        expect(Object.keys(reducedSpec.paths['/pet'])).toStrictEqual(['post']);
        expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get']);
        expect(reducedSpec.info.title).toBe(title);
      });
    });
  });

  describe('error handling', () => {
    it.each([['json'], ['yaml']])('should fail if given a Swagger 2.0 definition (format: %s)', async format => {
      const spec = require.resolve(`@readme/oas-examples/2.0/${format}/petstore.${format}`);

      const { error } = await run([spec]);
      expect(error).toMatchSnapshot();
    });

    it('should fail if you attempt to reduce a spec to nothing via tags', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      prompts.inject(['tags', ['unknown-tag'], 'output.json']);

      const { error } = await run([spec]);
      expect(error).toMatchSnapshot();
    });

    it('should fail if you attempt to reduce a spec to nothing via paths', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      prompts.inject(['paths', ['unknown-path'], 'output.json']);

      const { error } = await run([spec]);
      expect(error).toMatchSnapshot();
    });

    it('should fail if you attempt to pass both tags and paths as opts', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      const { error } = await run([spec, '--tag', 'tag1', '--tag', 'tag2', '--path', '/path']);
      expect(error).toMatchSnapshot();
    });

    it('should fail if you attempt to pass both tags and methods as opts', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      const { error } = await run([spec, '--tag', 'tag1', '--tag', 'tag2', '--method', 'get']);
      expect(error).toMatchSnapshot();
    });

    it('should fail if you attempt to pass non-existent path and no method', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      const { error } = await run([spec, '--path', '/unknown-path']);
      expect(error).toMatchSnapshot();
    });
  });
});
