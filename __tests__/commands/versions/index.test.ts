import type { Version } from '../../../src/commands/versions/index.js';

import nock from 'nock';
import { describe, beforeAll, afterEach, it, expect } from 'vitest';

import Command from '../../../src/commands/versions/index.js';
import { getAPIV1Mock } from '../../helpers/get-api-mock.js';
import { runCommand } from '../../helpers/oclif.js';

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
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    nock.disableNetConnect();
    run = (args: string[]) =>
      runCommand(Command)(args).then(({ error, result }) => {
        if (error) {
          throw error;
        }
        return result;
      });
  });

  afterEach(() => nock.cleanAll());

  it('should make a request to get a list of existing versions', async () => {
    const mockRequest = getAPIV1Mock()
      .get('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, [versionPayload, version2Payload]);

    const output = await run(['--key', key]);
    expect(output).toStrictEqual(JSON.stringify([versionPayload, version2Payload], null, 2));
    mockRequest.done();
  });

  it('should get a specific version object if version flag provided', async () => {
    const mockRequest = getAPIV1Mock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, versionPayload);

    const output = await run(['--key', key, '--version', version]);
    expect(output).toStrictEqual(JSON.stringify(versionPayload, null, 2));
    mockRequest.done();
  });
});
