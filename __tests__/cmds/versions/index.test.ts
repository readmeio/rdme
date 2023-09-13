import type { Version } from '../../../src/cmds/versions';

import nock from 'nock';
import prompts from 'prompts';
import { describe, beforeAll, afterEach, it, expect, vi } from 'vitest';

import VersionsCommand from '../../../src/cmds/versions';
import getAPIMock from '../../helpers/get-api-mock';

const key = 'API_KEY';
const version = '1.0.0';
const version2 = '2.0.0';

const versionPayload: Version = {
  createdAt: '2019-06-17T22:39:56.462Z',
  is_deprecated: false,
  is_hidden: false,
  is_beta: false,
  is_stable: true,
  codename: '',
  version,
};

const version2Payload: Version = {
  createdAt: '2019-06-17T22:39:56.462Z',
  is_deprecated: false,
  is_hidden: false,
  is_beta: false,
  is_stable: true,
  codename: '',
  version: version2,
};

const versions = new VersionsCommand();

describe('rdme versions', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => nock.cleanAll());

  it('should prompt for login if no API key provided', async () => {
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    prompts.inject(['this-is-not-an-email', 'password', 'subdomain']);
    await expect(versions.run({})).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
    consoleInfoSpy.mockRestore();
  });

  it('should error in CI if no API key provided', async () => {
    process.env.TEST_RDME_CI = 'true';
    await expect(versions.run({})).rejects.toStrictEqual(new Error('No project API key provided. Please use `--key`.'));
    delete process.env.TEST_RDME_CI;
  });

  it('should make a request to get a list of existing versions', async () => {
    const mockRequest = getAPIMock()
      .get('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, [versionPayload, version2Payload]);

    const output = await versions.run({ key });
    expect(output).toStrictEqual(JSON.stringify([versionPayload, version2Payload], null, 2));
    mockRequest.done();
  });

  it('should get a specific version object if version flag provided', async () => {
    const mockRequest = getAPIMock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, versionPayload);

    const output = await versions.run({ key, version });
    expect(output).toStrictEqual(JSON.stringify(versionPayload, null, 2));
    mockRequest.done();
  });
});
