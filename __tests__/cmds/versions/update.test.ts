import nock from 'nock';

import UpdateVersionCommand from '../../../src/cmds/versions/update';
import APIError from '../../../src/lib/apiError';
import getAPIMock from '../../helpers/get-api-mock';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const promptHandler = require('../../../src/lib/prompts');

const key = 'API_KEY';
const version = '1.0.0';

jest.mock('../../../src/lib/prompts');

const updateVersion = new UpdateVersionCommand();

describe('rdme versions:update', () => {
  beforeAll(() => nock.disableNetConnect());

  afterEach(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(updateVersion.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.')
    );
  });

  it('should update a specific version object', async () => {
    promptHandler.createVersionPrompt.mockResolvedValue({
      is_stable: false,
      is_beta: false,
      is_deprecated: true,
    });

    const mockRequest = getAPIMock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version })
      .put(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(201, { version })
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    await expect(updateVersion.run({ key, version })).resolves.toBe('Version 1.0.0 updated successfully.');
    mockRequest.done();
  });

  it('should catch any put request errors', async () => {
    promptHandler.createVersionPrompt.mockResolvedValue({
      is_stable: false,
      is_beta: false,
    });

    const errorResponse = {
      error: 'VERSION_CANT_DEMOTE_STABLE',
      message: "You can't make a stable version non-stable",
      suggestion: '...a suggestion to resolve the issue...',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    const mockRequest = getAPIMock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version })
      .put(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(400, errorResponse)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    await expect(updateVersion.run({ key, version })).rejects.toStrictEqual(new APIError(errorResponse));
    mockRequest.done();
  });
});
