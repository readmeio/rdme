import nock from 'nock';

import VersionsCommand from '../../../src/cmds/versions';
import getAPIMock from '../../helpers/get-api-mock';

const key = 'API_KEY';
const version = '1.0.0';
const version2 = '2.0.0';

const versionPayload = {
  createdAt: '2019-06-17T22:39:56.462Z',
  is_deprecated: false,
  is_hidden: false,
  is_beta: false,
  is_stable: true,
  codename: '',
  version,
};

const version2Payload = {
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
  beforeAll(() => nock.disableNetConnect());

  afterEach(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(versions.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.')
    );
  });

  it('should make a request to get a list of existing versions', async () => {
    const mockRequest = getAPIMock()
      .get('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, [versionPayload, version2Payload]);

    const table = await versions.run({ key });
    expect(table).toContain(version);
    expect(table).toContain(version2);
    mockRequest.done();
  });

  it('should make a request to get a list of existing versions and return them in a raw format', async () => {
    const mockRequest = getAPIMock()
      .get('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, [versionPayload, version2Payload]);

    const raw = await versions.run({ key, raw: true });
    expect(raw).toStrictEqual(JSON.stringify([versionPayload, version2Payload], null, 2));
    mockRequest.done();
  });

  it('should get a specific version object if version flag provided', async () => {
    const mockRequest = getAPIMock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, versionPayload);

    const table = await versions.run({ key, version });
    expect(table).toContain(version);
    expect(table).not.toContain(version2);
    mockRequest.done();
  });

  it('should get a specific version object if version flag provided and return it in a raw format', async () => {
    const mockRequest = getAPIMock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, versionPayload);

    const raw = await versions.run({ key, version, raw: true });
    expect(raw).toStrictEqual(JSON.stringify(versionPayload, null, 2));
    mockRequest.done();
  });
});
