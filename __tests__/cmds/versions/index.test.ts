import type { Version } from '../../../src/cmds/versions/index.js';
import type { Config } from '@oclif/core';

import nock from 'nock';
import prompts from 'prompts';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi } from 'vitest';

import getAPIMock from '../../helpers/get-api-mock.js';
import setupOclifConfig from '../../helpers/setup-oclif-config.js';

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

describe('rdme versions', () => {
  let oclifConfig: Config;
  let run: (args?: string[]) => Promise<unknown>;

  beforeAll(() => {
    nock.disableNetConnect();
  });

  beforeEach(async () => {
    oclifConfig = await setupOclifConfig();
    run = (args?: string[]) => oclifConfig.runCommand('versions', args);
  });

  afterEach(() => nock.cleanAll());

  it('should make a request to get a list of existing versions', async () => {
    const mockRequest = getAPIMock()
      .get('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, [versionPayload, version2Payload]);

    const output = await run(['--key', key]);
    expect(output).toStrictEqual(JSON.stringify([versionPayload, version2Payload], null, 2));
    mockRequest.done();
  });

  it('should get a specific version object if version flag provided', async () => {
    const mockRequest = getAPIMock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, versionPayload);

    const output = await run(['--key', key, '--version', version]);
    expect(output).toStrictEqual(JSON.stringify(versionPayload, null, 2));
    mockRequest.done();
  });
});
