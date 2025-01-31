/* eslint-disable no-console */
import type { OASDocument } from 'oas/types';

import fs from 'node:fs';

import chalk from 'chalk';
import prompts from 'prompts';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi, type MockInstance } from 'vitest';

import Command from '../../../src/commands/openapi/reduce.js';
import { runCommandAndReturnResult } from '../../helpers/oclif.js';

const successfulReduction = () => 'Your reduced API definition has been saved to output.json! 🤏';

let consoleInfoSpy: MockInstance<typeof console.info>;
const getCommandOutput = () => consoleInfoSpy.mock.calls.join('\n\n');

describe('rdme openapi reduce', () => {
  let fsWriteFileSyncSpy: MockInstance<typeof fs.writeFileSync>;
  let reducedSpec: OASDocument;
  let run: (args?: string[]) => Promise<unknown>;
  let testWorkingDir: string;

  beforeAll(() => {
    run = runCommandAndReturnResult(Command);
  });

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    testWorkingDir = process.cwd();
    fsWriteFileSyncSpy = vi.spyOn(fs, 'writeFileSync').mockImplementationOnce((filename, data) => {
      reducedSpec = JSON.parse(data as string);
    });
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
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

        await expect(run([spec])).resolves.toBe(successfulReduction());

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
        const spec = 'petstore.json';

        prompts.inject(['tags', ['user'], 'output.json']);

        await expect(run(['--workingDirectory', './__tests__/__fixtures__/relative-ref-oas'])).resolves.toBe(
          successfulReduction(),
        );

        expect(console.info).toHaveBeenCalledTimes(1);

        const output = getCommandOutput();
        expect(output).toBe(chalk.yellow(`ℹ️  We found ${spec} and are attempting to reduce it.`));

        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/user']);
      });

      it('should reduce with no prompts via opts', async () => {
        const spec = 'petstore.json';

        await expect(
          run([
            '--workingDirectory',
            './__tests__/__fixtures__/relative-ref-oas',
            '--tag',
            'user',
            '--out',
            'output.json',
          ]),
        ).resolves.toBe(successfulReduction());

        expect(console.info).toHaveBeenCalledTimes(1);

        const output = getCommandOutput();
        expect(output).toBe(chalk.yellow(`ℹ️  We found ${spec} and are attempting to reduce it.`));

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

        await expect(run([spec])).resolves.toBe(successfulReduction());

        expect(fsWriteFileSyncSpy).toHaveBeenCalledWith('output.json', expect.any(String));
        expect(reducedSpec.tags).toHaveLength(1);
        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet', '/pet/findByStatus']);
        expect(Object.keys(reducedSpec.paths['/pet'])).toStrictEqual(['post']);
        expect(Object.keys(reducedSpec.paths['/pet/findByStatus'])).toStrictEqual(['get']);
      });

      it('should reduce with no prompts via opts', async () => {
        const spec = 'petstore.json';

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
        ).resolves.toBe(successfulReduction());

        expect(console.info).toHaveBeenCalledTimes(1);

        const output = getCommandOutput();
        expect(output).toBe(chalk.yellow(`ℹ️  We found ${spec} and are attempting to reduce it.`));

        expect(fsWriteFileSyncSpy).toHaveBeenCalledWith('output.json', expect.any(String));
        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet', '/pet/{petId}']);
        expect(Object.keys(reducedSpec.paths['/pet'])).toStrictEqual(['post']);
        expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get']);
      });

      it('should reduce and update title with no prompts via opts', async () => {
        const spec = 'petstore.json';
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
        ).resolves.toBe(successfulReduction());

        expect(console.info).toHaveBeenCalledTimes(1);

        const output = getCommandOutput();
        expect(output).toBe(chalk.yellow(`ℹ️  We found ${spec} and are attempting to reduce it.`));

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

      await expect(run([spec])).rejects.toStrictEqual(
        new Error('Sorry, this reducer feature in rdme only supports OpenAPI 3.0+ definitions.'),
      );
    });

    it('should fail if you attempt to reduce a spec to nothing via tags', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      prompts.inject(['tags', ['unknown-tag'], 'output.json']);

      await expect(run([spec])).rejects.toStrictEqual(
        new Error('All paths in the API definition were removed. Did you supply the right path name to reduce by?'),
      );
    });

    it('should fail if you attempt to reduce a spec to nothing via paths', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      prompts.inject(['paths', ['unknown-path'], 'output.json']);

      await expect(run([spec])).rejects.toStrictEqual(
        new Error('All paths in the API definition were removed. Did you supply the right path name to reduce by?'),
      );
    });

    it('should fail if you attempt to pass both tags and paths as opts', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      await expect(run([spec, '--tag', 'tag1', '--tag', 'tag2', '--path', '/path'])).rejects.toStrictEqual(
        new Error('You can pass in either tags or paths/methods, but not both.'),
      );
    });

    it('should fail if you attempt to pass both tags and methods as opts', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      await expect(run([spec, '--tag', 'tag1', '--tag', 'tag2', '--method', 'get'])).rejects.toStrictEqual(
        new Error('You can pass in either tags or paths/methods, but not both.'),
      );
    });

    it('should fail if you attempt to pass non-existent path and no method', async () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');

      await expect(run([spec, '--path', 'unknown-path'])).rejects.toStrictEqual(
        new Error('All paths in the API definition were removed. Did you supply the right path name to reduce by?'),
      );
    });
  });
});
