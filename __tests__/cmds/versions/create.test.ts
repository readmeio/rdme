import nock from 'nock';
import prompts from 'prompts';

import CreateVersionCommand from '../../../src/cmds/versions/create';
import APIError from '../../../src/lib/apiError';
import getAPIMock from '../../helpers/get-api-mock';

const key = 'API_KEY';
const version = '1.0.0';

const createVersion = new CreateVersionCommand();

describe('rdme versions:create', () => {
  beforeAll(() => nock.disableNetConnect());

  afterEach(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(createVersion.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.')
    );
  });

  it('should error if no version provided', () => {
    return expect(createVersion.run({ key })).rejects.toStrictEqual(
      new Error('Please specify a semantic version. See `rdme help versions:create` for help.')
    );
  });

  it('should error if invaild version provided', () => {
    return expect(createVersion.run({ key, version: 'test' })).rejects.toStrictEqual(
      new Error('Please specify a semantic version. See `rdme help versions:create` for help.')
    );
  });

  it('should create a specific version', async () => {
    prompts.inject([version, false, true, true]);
    const newVersion = '1.0.1';

    const mockRequest = getAPIMock()
      .get('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, [{ version }, { version: '1.1.0' }])
      .post('/api/v1/version', {
        version: newVersion,
        codename: '',
        is_stable: false,
        is_beta: true,
        from: '1.0.0',
        is_hidden: false,
      })
      .basicAuth({ user: key })
      .reply(201, { version: newVersion });

    await expect(createVersion.run({ key, version: newVersion })).resolves.toBe(
      `Version ${newVersion} created successfully.`
    );
    mockRequest.done();
  });

  it('should create a specific version with options', async () => {
    const newVersion = '1.0.1';

    const mockRequest = getAPIMock()
      .post('/api/v1/version', {
        version: newVersion,
        codename: 'test',
        from: '1.0.0',
        is_hidden: false,
      })
      .basicAuth({ user: key })
      .reply(201, { version: newVersion });

    await expect(
      createVersion.run({
        key,
        version: newVersion,
        fork: version,
        beta: 'false',
        main: 'false',
        codename: 'test',
        isPublic: 'true',
      })
    ).resolves.toBe(`Version ${newVersion} created successfully.`);

    mockRequest.done();
  });

  it('should catch any post request errors', async () => {
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
