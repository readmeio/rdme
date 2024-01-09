import type { Config } from '@oclif/core';

import fs from 'node:fs';

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

import setupOclifConfig from '../../helpers/setup-oclif-config.js';

const successfulConversion = () => 'Your API definition has been converted and bundled and saved to output.json!';

describe('rdme openapi:convert (single-threaded)', () => {
  let oclifConfig: Config;
  let run: (args?: string[]) => Promise<unknown>;
  let testWorkingDir: string;

  beforeEach(async () => {
    oclifConfig = await setupOclifConfig();
    run = (args?: string[]) => oclifConfig.runCommand('openapi:convert', args);
    testWorkingDir = process.cwd();
  });

  afterEach(() => {
    process.chdir(testWorkingDir);

    vi.clearAllMocks();
  });

  describe('converting', () => {
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
  });
});
