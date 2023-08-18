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

  it('should prompt for login if no API key provided', async () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    prompts.inject(['this-is-not-an-email', 'password', 'subdomain']);
    await expect(createVersion.run({})).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
    consoleInfoSpy.mockRestore();
  });

  it('should error in CI if no API key provided', async () => {
    process.env.TEST_RDME_CI = 'true';
    await expect(createVersion.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.')
    );
    delete process.env.TEST_RDME_CI;
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
        is_beta: false,
        is_deprecated: false,
        is_hidden: false,
        is_stable: false,
      })
      .basicAuth({ user: key })
      .reply(201, { version: newVersion });

    await expect(
      createVersion.run({
        key,
        version: newVersion,
        fork: version,
        beta: 'false',
        deprecated: 'false',
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

  describe('bad flag values', () => {
    it('should throw if non-boolean `beta` flag is passed', () => {
      const newVersion = '1.0.1';

      return expect(
        createVersion.run({
          key,
          version: newVersion,
          fork: version,
          // @ts-expect-error deliberately passing a bad value here
          beta: 'test',
        })
      ).rejects.toStrictEqual(new Error("Invalid option passed for 'beta'. Must be 'true' or 'false'."));
    });

    it('should throw if non-boolean `deprecated` flag is passed', () => {
      const newVersion = '1.0.1';

      return expect(
        createVersion.run({
          key,
          version: newVersion,
          fork: version,
          // @ts-expect-error deliberately passing a bad value here
          deprecated: 'test',
        })
      ).rejects.toStrictEqual(new Error("Invalid option passed for 'deprecated'. Must be 'true' or 'false'."));
    });

    it('should throw if non-boolean `isPublic` flag is passed', () => {
      const newVersion = '1.0.1';

      return expect(
        createVersion.run({
          key,
          version: newVersion,
          fork: version,
          // @ts-expect-error deliberately passing a bad value here
          isPublic: 'test',
        })
      ).rejects.toStrictEqual(new Error("Invalid option passed for 'isPublic'. Must be 'true' or 'false'."));
    });

    it('should throw if non-boolean `main` flag is passed', () => {
      const newVersion = '1.0.1';

      return expect(
        createVersion.run({
          key,
          version: newVersion,
          fork: version,
          // @ts-expect-error deliberately passing a bad value here
          main: 'test',
        })
      ).rejects.toStrictEqual(new Error("Invalid option passed for 'main'. Must be 'true' or 'false'."));
    });
  });
});
