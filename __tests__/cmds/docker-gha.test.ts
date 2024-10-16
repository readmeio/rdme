import type { Config } from '@oclif/core';

import { describe, beforeEach, it, expect, vi } from 'vitest';

import setupOclifConfig from '../helpers/setup-oclif-config.js';

describe('rdme docker-gha (single arg string from GitHub Actions runner)', () => {
  let oclifConfig: Config;
  let run: (args?: string[]) => Promise<unknown>;

  beforeEach(async () => {
    oclifConfig = await setupOclifConfig();
    run = (args?: string[]) => oclifConfig.runCommand('docker-gha', args);
  });

  it('should return version from package.json for help command', async () => {
    const output: string[] = [];
    const spy = vi.spyOn(console, 'log');
    spy.mockImplementation(msg => {
      if (typeof msg === 'string') output.push(msg);
      return true;
    });
    await expect(run(['help'])).resolves.toBeUndefined();
    expect(output.join('\n')).toContain("ReadMe's official CLI and GitHub Action.");
    spy.mockClear();
  });

  it('should throw error if no arguments are passed', () => {
    return expect(run()).rejects.toStrictEqual(new Error("Oops! Looks like you're missing a command."));
  });

  it('should handle a single arg', async () => {
    vi.stubEnv('TEST_RDME_CI', 'true');
    await expect(run(['openapi:validate'])).rejects.toThrow(
      'Multiple API definitions found in current directory. Please specify file.',
    );
    vi.unstubAllEnvs();
  });

  it('should handle an empty arg', () => {
    return expect(run([' '])).rejects.toThrow('command undefined not found');
  });

  it('should validate file (file path in quotes)', () => {
    return expect(run(['openapi:validate "__tests__/__fixtures__/petstore-simple-weird-version.json"'])).resolves.toBe(
      '__tests__/__fixtures__/petstore-simple-weird-version.json is a valid OpenAPI API definition!',
    );
  });

  it('should attempt to validate file (file path contains spaces)', () => {
    return expect(run(['openapi:validate "a non-existent directory/petstore.json"'])).rejects.toThrow(
      "ENOENT: no such file or directory, open 'a non-existent directory/petstore.json",
    );
  });
});
