import type { Config } from '@oclif/core';

import nock from 'nock';
import prompts from 'prompts';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi } from 'vitest';

import getAPIMock, { getAPIMockWithVersionHeader } from '../../helpers/get-api-mock.js';
import setupOclifConfig from '../../helpers/setup-oclif-config.js';

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme categories', () => {
  let oclifConfig: Config;
  let run: (args?: string[]) => Promise<unknown>;

  beforeAll(() => {
    nock.disableNetConnect();
  });

  beforeEach(async () => {
    oclifConfig = await setupOclifConfig();
    run = (args?: string[]) => oclifConfig.runCommand('categories', args);
  });

  afterEach(() => nock.cleanAll());

  it('should prompt for login if no API key provided', async () => {
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    prompts.inject(['this-is-not-an-email', 'password', 'subdomain']);
    await expect(run()).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
    consoleInfoSpy.mockRestore();
  });

  it('should error in CI if no API key provided', async () => {
    process.env.TEST_RDME_CI = 'true';
    await expect(run()).rejects.toStrictEqual(new Error('No project API key provided. Please use `--key`.'));
    delete process.env.TEST_RDME_CI;
  });

  it('should return all categories for a single page', async () => {
    const getMock = getAPIMockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'One Category', slug: 'one-category', type: 'guide' }], {
        'x-total-count': '1',
      });

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(run(['--key', key, '--version', '1.0.0'])).resolves.toBe(
      JSON.stringify([{ title: 'One Category', slug: 'one-category', type: 'guide' }], null, 2),
    );

    getMock.done();
    versionMock.done();
  });

  it('should return all categories for multiple pages', async () => {
    const getMock = getAPIMockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'One Category', slug: 'one-category', type: 'guide' }], {
        'x-total-count': '21',
      })
      .get('/api/v1/categories?perPage=20&page=2')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'Another Category', slug: 'another-category', type: 'guide' }], {
        'x-total-count': '21',
      });

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(run(['--key', key, '--version', '1.0.0'])).resolves.toBe(
      JSON.stringify(
        [
          { title: 'One Category', slug: 'one-category', type: 'guide' },
          { title: 'Another Category', slug: 'another-category', type: 'guide' },
        ],
        null,
        2,
      ),
    );

    getMock.done();
    versionMock.done();
  });
});
