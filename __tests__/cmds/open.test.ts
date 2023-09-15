import type { Version } from '../../src/cmds/versions/index.js';

import chalk from 'chalk';
import { describe, afterEach, it, expect } from 'vitest';

import Command from '../../src/cmds/open.js';
import config from '../../src/lib/config.js';
import configStore from '../../src/lib/configstore.js';
import getAPIMock from '../helpers/get-api-mock.js';

const cmd = new Command();

describe('rdme open', () => {
  afterEach(() => {
    configStore.clear();
  });

  it('should error if no project provided', () => {
    configStore.delete('project');

    return expect(cmd.run({})).rejects.toStrictEqual(new Error(`Please login using \`${config.cli} login\`.`));
  });

  it('should open the project', () => {
    expect.assertions(2);
    configStore.set('project', 'subdomain');

    const projectUrl = 'https://subdomain.readme.io';

    function mockOpen(url: string) {
      expect(url).toBe(projectUrl);
      return Promise.resolve();
    }

    return expect(cmd.run({ mockOpen })).resolves.toBe(`Opening ${chalk.green(projectUrl)} in your browser...`);
  });

  describe('open --dash', () => {
    it('should open the dash', async () => {
      expect.assertions(2);
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

      function mockOpen(url: string) {
        expect(url).toBe(dashUrl);
        return Promise.resolve();
      }

      await expect(cmd.run({ mockOpen, dash: true })).resolves.toBe(
        `Opening ${chalk.green(dashUrl)} in your browser...`,
      );
      mockRequest.done();
    });

    it('should require user to be logged in', () => {
      configStore.set('project', 'subdomain');

      const dashUrl = 'https://dash.readme.com/project/subdomain/v1.0/overview';

      function mockOpen(url: string) {
        expect(url).toBe(dashUrl);
        return Promise.resolve();
      }

      return expect(cmd.run({ mockOpen, dash: true })).rejects.toStrictEqual(
        new Error(`Please login using \`${config.cli} login\`.`),
      );
    });
  });
});
