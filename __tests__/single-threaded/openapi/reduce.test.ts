/* eslint-disable no-console */
import fs from 'node:fs';

import chalk from 'chalk';
import prompts from 'prompts';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import OpenAPIReduceCommand from '../../../src/cmds/openapi/reduce.js';

const reducer = new OpenAPIReduceCommand();

const successfulReduction = () => 'Your reduced API definition has been saved to output.json! 🤏';

let consoleInfoSpy;
const getCommandOutput = () => consoleInfoSpy.mock.calls.join('\n\n');

describe('rdme openapi:reduce (single-threaded)', () => {
  let testWorkingDir: string;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    testWorkingDir = process.cwd();
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();

    process.chdir(testWorkingDir);

    vi.clearAllMocks();
  });

  describe('reducing', () => {
    describe('by tag', () => {
      it('should discover and upload an API definition if none is provided', async () => {
        const spec = 'petstore.json';

        let reducedSpec;
        fs.writeFileSync = vi.fn((fileName, data) => {
          reducedSpec = JSON.parse(data as string);
        });

        prompts.inject(['tags', ['user'], 'output.json']);

        await expect(
          reducer.run({
            workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
          }),
        ).resolves.toBe(successfulReduction());

        expect(console.info).toHaveBeenCalledTimes(1);

        const output = getCommandOutput();
        expect(output).toBe(chalk.yellow(`ℹ️  We found ${spec} and are attempting to reduce it.`));

        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/user']);
      });

      it('should reduce with no prompts via opts', async () => {
        const spec = 'petstore.json';

        let reducedSpec;
        fs.writeFileSync = vi.fn((fileName, data) => {
          reducedSpec = JSON.parse(data as string);
        });

        await expect(
          reducer.run({
            workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
            tag: ['user'],
            out: 'output.json',
          }),
        ).resolves.toBe(successfulReduction());

        expect(console.info).toHaveBeenCalledTimes(1);

        const output = getCommandOutput();
        expect(output).toBe(chalk.yellow(`ℹ️  We found ${spec} and are attempting to reduce it.`));

        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/user']);
      });
    });

    describe('by path', () => {
      it('should reduce with no prompts via opts', async () => {
        const spec = 'petstore.json';

        let reducedSpec;
        fs.writeFileSync = vi.fn((fileName, data) => {
          reducedSpec = JSON.parse(data as string);
        });

        await expect(
          reducer.run({
            workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
            path: ['/pet', '/pet/{petId}'],
            method: ['get', 'post'],
            out: 'output.json',
          }),
        ).resolves.toBe(successfulReduction());

        expect(console.info).toHaveBeenCalledTimes(1);

        const output = getCommandOutput();
        expect(output).toBe(chalk.yellow(`ℹ️  We found ${spec} and are attempting to reduce it.`));

        expect(fs.writeFileSync).toHaveBeenCalledWith('output.json', expect.any(String));
        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet', '/pet/{petId}']);
        expect(Object.keys(reducedSpec.paths['/pet'])).toStrictEqual(['post']);
        expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get']);
      });

      it('should reduce and update title with no prompts via opts', async () => {
        const spec = 'petstore.json';
        const title = 'some alternative title';

        let reducedSpec;
        fs.writeFileSync = vi.fn((fileName, data) => {
          reducedSpec = JSON.parse(data as string);
        });

        await expect(
          reducer.run({
            workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
            path: ['/pet', '/pet/{petId}'],
            method: ['get', 'post'],
            title,
            out: 'output.json',
          }),
        ).resolves.toBe(successfulReduction());

        expect(console.info).toHaveBeenCalledTimes(1);

        const output = getCommandOutput();
        expect(output).toBe(chalk.yellow(`ℹ️  We found ${spec} and are attempting to reduce it.`));

        expect(fs.writeFileSync).toHaveBeenCalledWith('output.json', expect.any(String));
        expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet', '/pet/{petId}']);
        expect(Object.keys(reducedSpec.paths['/pet'])).toStrictEqual(['post']);
        expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get']);
        expect(reducedSpec.info.title).toBe(title);
      });
    });
  });
});
