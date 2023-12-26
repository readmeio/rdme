import type { Version } from '../../src/cmds/versions/index.js';
import type { Config } from '@oclif/core';

import chalk from 'chalk';
import { describe, afterEach, beforeEach, it, expect } from 'vitest';

import config from '../../src/lib/config.js';
import configStore from '../../src/lib/configstore.js';
import getAPIMock from '../helpers/get-api-mock.js';
import setupOclifConfig from '../helpers/setup-oclif-config.js';

const mockArg = ['--mock'];

describe('rdme open', () => {
  let oclifConfig: Config;
  let run: (args?: string[]) => Promise<unknown>;

  beforeEach(async () => {
    oclifConfig = await setupOclifConfig();
    run = (args?: string[]) => oclifConfig.runCommand('open', args);
  });

  afterEach(() => {
    configStore.clear();
  });

  it('should error if no project provided', () => {
    configStore.delete('project');

    return expect(run(mockArg)).rejects.toStrictEqual(new Error(`Please login using \`${config.cli} login\`.`));
  });

  it('should open the project', () => {
    configStore.set('project', 'subdomain');

    const projectUrl = 'https://subdomain.readme.io';

    return expect(run(mockArg)).resolves.toBe(`Opening ${chalk.green(projectUrl)} in your browser...`);
  });

  describe('open --dash', () => {
    it('should open the dash', async () => {
      configStore.set('project', 'subdomain');
      configStore.set('apiKey', '12345');

      const version = '1.0';
      const key = '12345';
      const versionPayload: Version = {
        createdAt: '2019-06-17T22:39:56.462Z',
        is_deprecated: false,
        is_hidden: false,
        is_beta: false,
        is_stable: true,
        codename: '',
        version,
      };

      const mockRequest = getAPIMock()
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [versionPayload, { version: '1.0.1' }]);

      const dashUrl = 'https://dash.readme.com/project/subdomain/v1.0/overview';

      await expect(run(mockArg.concat('--dash'))).resolves.toBe(`Opening ${chalk.green(dashUrl)} in your browser...`);
      mockRequest.done();
    });

    it('should require user to be logged in', () => {
      configStore.set('project', 'subdomain');

      return expect(run(mockArg.concat('--dash'))).rejects.toStrictEqual(
        new Error(`Please login using \`${config.cli} login\`.`),
      );
    });
  });
});
