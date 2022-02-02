const nock = require('nock');
const promptHandler = require('../../src/lib/prompts');
const APIError = require('../../src/lib/apiError');
const getApiNock = require('../get-api-nock');

const VersionsCommand = require('../../src/cmds/versions');
const CreateVersionCommand = require('../../src/cmds/versions/create');
const DeleteVersionCommand = require('../../src/cmds/versions/delete');
const UpdateVersionCommand = require('../../src/cmds/versions/update');

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

jest.mock('../../src/lib/prompts');

describe('rdme versions*', () => {
  beforeAll(() => nock.disableNetConnect());

  afterEach(() => nock.cleanAll());

  describe('rdme versions', () => {
    const versions = new VersionsCommand();

    it('should error if no api key provided', () => {
      return expect(versions.run({})).rejects.toStrictEqual(
        new Error('No project API key provided. Please use `--key`.')
      );
    });

    it('should make a request to get a list of existing versions', async () => {
      const mockRequest = getApiNock()
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [versionPayload, version2Payload]);

      const table = await versions.run({ key });
      expect(table).toContain(version);
      expect(table).toContain(version2);
      mockRequest.done();
    });

    it('should make a request to get a list of existing versions and return them in a raw format', async () => {
      const mockRequest = getApiNock()
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [versionPayload, version2Payload]);

      const raw = await versions.run({ key, raw: true });
      expect(raw).toStrictEqual(JSON.stringify([versionPayload, version2Payload], null, 2));
      mockRequest.done();
    });

    it('should get a specific version object if version flag provided', async () => {
      const mockRequest = getApiNock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, versionPayload);

      const table = await versions.run({ key, version });
      expect(table).toContain(version);
      expect(table).not.toContain(version2);
      mockRequest.done();
    });

    it('should get a specific version object if version flag provided and return it in a raw format', async () => {
      const mockRequest = getApiNock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, versionPayload);

      const raw = await versions.run({ key, version, raw: true });
      expect(raw).toStrictEqual(JSON.stringify(versionPayload, null, 2));
      mockRequest.done();
    });
  });

  describe('rdme versions:create', () => {
    const createVersion = new CreateVersionCommand();

    it('should error if no api key provided', () => {
      return expect(createVersion.run({})).rejects.toThrow('No project API key provided. Please use `--key`.');
    });

    it('should create a specific version', async () => {
      promptHandler.createVersionPrompt.mockResolvedValue({
        is_stable: true,
        is_beta: false,
        from: '1.0.0',
      });

      const mockRequest = getApiNock()
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

      const mockRequest = getApiNock().post('/api/v1/version').basicAuth({ user: key }).reply(400, errorResponse);

      await expect(createVersion.run({ key, version, fork: '0.0.5' })).rejects.toStrictEqual(
        new APIError(errorResponse)
      );
      mockRequest.done();
    });
  });

  describe('rdme versions:delete', () => {
    const deleteVersion = new DeleteVersionCommand();

    it('should error if no api key provided', () => {
      return expect(deleteVersion.run({})).rejects.toStrictEqual(
        new Error('No project API key provided. Please use `--key`.')
      );
    });

    it('should delete a specific version', async () => {
      const mockRequest = getApiNock()
        .delete(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { removed: true })
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(deleteVersion.run({ key, version })).resolves.toBe('Version 1.0.0 deleted successfully.');
      mockRequest.done();
    });

    it('should catch any request errors', async () => {
      const errorResponse = {
        error: 'VERSION_NOTFOUND',
        message:
          "The version you specified ({version}) doesn't match any of the existing versions ({versions_list}) in ReadMe.",
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      };

      const mockRequest = getApiNock()
        .delete(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(404, errorResponse)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(deleteVersion.run({ key, version })).rejects.toStrictEqual(new APIError(errorResponse));
      mockRequest.done();
    });
  });

  describe('rdme versions:update', () => {
    const updateVersion = new UpdateVersionCommand();

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

      const mockRequest = getApiNock()
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

      const mockRequest = getApiNock()
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
});
