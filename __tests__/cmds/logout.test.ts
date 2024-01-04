import type { Config } from '@oclif/core';

import { describe, afterEach, beforeEach, it, expect } from 'vitest';

import configStore from '../../src/lib/configstore.js';
import setupOclifConfig from '../helpers/setup-oclif-config.js';

describe('rdme logout', () => {
  let oclifConfig: Config;
  let run: (args?: string[]) => Promise<unknown>;

  beforeEach(async () => {
    oclifConfig = await setupOclifConfig();
    run = (args?: string[]) => oclifConfig.runCommand('logout', args);
  });

  afterEach(() => {
    configStore.clear();
  });

  it("should report the user as logged out if they aren't logged in", () => {
    configStore.delete('email');
    configStore.delete('project');

    return expect(run()).resolves.toBe(
      `You have logged out of ReadMe. Please use \`${oclifConfig.bin} login\` to login again.`,
    );
  });

  it('should log the user out', async () => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    await expect(run()).resolves.toBe(
      `You have logged out of ReadMe. Please use \`${oclifConfig.bin} login\` to login again.`,
    );

    expect(configStore.get('email')).toBeUndefined();
    expect(configStore.get('project')).toBeUndefined();
  });
});
