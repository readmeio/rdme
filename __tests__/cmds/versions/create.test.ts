import nock from 'nock';

import CreateVersionCommand from '../../../src/cmds/versions/create';
import APIError from '../../../src/lib/apiError';
import getAPIMock from '../../helpers/get-api-mock';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const promptHandler = require('../../../src/lib/prompts');

const key = 'API_KEY';
const version = '1.0.0';

jest.mock('../../../src/lib/prompts');

const createVersion = new CreateVersionCommand();

describe('rdme versions:create', () => {
  beforeAll(() => nock.disableNetConnect());

  afterEach(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(createVersion.run({})).rejects.toThrow('No project API key provided. Please use `--key`.');
  });

  it('should create a specific version', async () => {
    promptHandler.createVersionPrompt.mockResolvedValue({
      is_stable: true,
      is_beta: false,
      from: '1.0.0',
    });

    const mockRequest = getAPIMock()
      .get('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, [{ version }, { version }])
      .post('/api/v1/version')
      .basicAuth({ user: key })
      .reply(201, { version });

    await expect(createVersion.run({ key, version })).resolves.toBe('Version 1.0.0 created successfully.');
    mockRequest.done();
  });

  it('should catch any post request errors', async () => {
    expect.assertions(1);
    promptHandler.createVersionPrompt.mockResolvedValue({
      is_stable: false,
      is_beta: false,
    });

    const errorResponse = {
      error: 'VERSION_EMPTY',
      message: 'You need to include an x-readme-version header',
      suggestion: '...a suggestion to resolve the issue...',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    const mockRequest = getAPIMock().post('/api/v1/version').basicAuth({ user: key }).reply(400, errorResponse);

    await expect(createVersion.run({ key, version, fork: '0.0.5' })).rejects.toStrictEqual(new APIError(errorResponse));
    mockRequest.done();
  });
});
