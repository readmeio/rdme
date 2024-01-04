import type { Config } from '@oclif/core';

import { describe, afterEach, it, expect, beforeEach } from 'vitest';

import configStore from '../../src/lib/configstore.js';
import setupOclifConfig from '../helpers/setup-oclif-config.js';

describe('rdme whoami', () => {
  let oclifConfig: Config;
  let run: (args?: string[]) => Promise<unknown>;

  beforeEach(async () => {
    oclifConfig = await setupOclifConfig();
    run = (args?: string[]) => oclifConfig.runCommand('whoami', args);
  });

  afterEach(() => {
    configStore.clear();
  });

  it('should error if user is not authenticated', () => {
    configStore.delete('email');
    configStore.delete('project');

    return expect(run()).rejects.toStrictEqual(new Error(`Please login using \`${oclifConfig.bin} login\`.`));
  });

  it('should return the authenticated user', () => {
    configStore.set('email', 'email@example.com');
    configStore.set('project', 'subdomain');

    return expect(run()).resolves.toMatchSnapshot();
  });
});
