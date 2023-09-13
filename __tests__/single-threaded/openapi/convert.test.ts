import fs from 'fs';

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

import OpenAPIConvertCommand from '../../../src/cmds/openapi/convert';

const convert = new OpenAPIConvertCommand();

const successfulConversion = () => 'Your converted API definition has been saved to output.json!';

describe('rdme openapi:convert (single-threaded)', () => {
  let testWorkingDir: string;

  beforeEach(() => {
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
        convert.run({
          spec,
          workingDirectory: require.resolve(`@readme/oas-examples/2.0/json/${spec}`).replace(spec, ''),
          out: 'output.json',
        }),
      ).resolves.toBe(successfulConversion());

      expect(fs.writeFileSync).toHaveBeenCalledWith('output.json', expect.any(String));
      expect(Object.keys(reducedSpec.paths)).toStrictEqual(['/pet/{petId}']);
      expect(Object.keys(reducedSpec.paths['/pet/{petId}'])).toStrictEqual(['get', 'post', 'delete']);
    });
  });
});
