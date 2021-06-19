const nock = require('nock');
const config = require('config');
const promptHandler = require('../../src/lib/prompts');

const versions = require('../../src/cmds/versions');
const createVersion = require('../../src/cmds/versions/create');
const deleteVersion = require('../../src/cmds/versions/delete');
const updateVersion = require('../../src/cmds/versions/update');

const key = 'Xmw4bGctRVIQz7R7dQXqH9nQe5d0SPQs';
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
    it('should error if no api key provided', () => {
      return versions.run({}).catch(err => {
        expect(err.message).toBe('No project API key provided. Please use `--key`.');
      });
    });

    it('should make a request to get a list of existing versions', async () => {
      const mockRequest = nock(config.host)
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [versionPayload, version2Payload]);

      const table = await versions.run({ key });
      expect(table).toContain(version);
      expect(table).toContain(version2);
      mockRequest.done();
    });

    it('should make a request to get a list of existing versions and return them in a raw format', async () => {
      const mockRequest = nock(config.host)
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [versionPayload, version2Payload]);

      const response = await versions.run({ key, raw: true });
      expect(response).toStrictEqual([versionPayload, version2Payload]);
      mockRequest.done();
    });

    it('should get a specific version object if version flag provided', () => {
      const mockRequest = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, versionPayload);

      return versions.run({ key, version }).then(table => {
        expect(table).toContain(version);
        expect(table).not.toContain(version2);
        mockRequest.done();
      });
    });

    it('should get a specific version object if version flag provided and return it in a raw format', () => {
      const mockRequest = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, versionPayload);

      return versions.run({ key, version, raw: true }).then(response => {
        expect(response).toStrictEqual(versionPayload);
        mockRequest.done();
      });
    });
  });

  describe('rdme versions:create', () => {
    it('should error if no api key provided', () => {
      expect.assertions(1);
      return createVersion.run({}).catch(err => {
        expect(err.message).toBe('No project API key provided. Please use `--key`.');
      });
    });

    it('should error if no version provided', () => {
      expect.assertions(1);
      return createVersion.run({ key }).catch(err => {
        expect(err.message).toBe('Please specify a semantic version. See `rdme help versions:create` for help.');
      });
    });

    it('should get a specific version object', () => {
      promptHandler.createVersionPrompt.mockResolvedValue({
        is_stable: true,
        is_beta: false,
        from: '1.0.0',
      });

      const mockRequest = nock(config.host)
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [{ version }, { version }])
        .post(`/api/v1/version`)
        .basicAuth({ user: key })
        .reply(201, { version });

      return createVersion.run({ key, version }).then(() => {
        mockRequest.done();
      });
    });

    it('should catch any post request errors', () => {
      expect.assertions(1);
      promptHandler.createVersionPrompt.mockResolvedValue({
        is_stable: false,
        is_beta: false,
      });

      const mockRequest = nock(config.host).post(`/api/v1/version`).basicAuth({ user: key }).reply(400, {
        error: 'VERSION_EMPTY',
        message: 'You need to include an x-readme-version header',
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      });

      return createVersion.run({ key, version, fork: '0.0.5' }).catch(err => {
        expect(err.message).toContain('You need to include an x-readme-version header');
        mockRequest.done();
      });
    });
  });

  describe('rdme versions:delete', () => {
    it('should error if no api key provided', () => {
      expect.assertions(1);
      return deleteVersion.run({}).catch(err => {
        expect(err.message).toBe('No project API key provided. Please use `--key`.');
      });
    });

    it('should error if no version provided', () => {
      expect.assertions(1);
      return deleteVersion.run({ key }).catch(err => {
        expect(err.message).toBe('Please specify a semantic version. See `rdme help versions:delete` for help.');
      });
    });

    it('should delete a specific version', () => {
      const mockRequest = nock(config.host).delete(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200);

      return deleteVersion.run({ key, version }).then(() => {
        mockRequest.done();
      });
    });

    it('should catch any request errors', () => {
      const mockRequest = nock(config.host).delete(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(404, {
        error: 'VERSION_NOTFOUND',
        message:
          "The version you specified ({version}) doesn't match any of the existing versions ({versions_list}) in ReadMe.",
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      });

      return deleteVersion.run({ key, version }).catch(err => {
        expect(err.message).toContain('The version you specified');
        mockRequest.done();
      });
    });
  });

  describe('rdme versions:update', () => {
    it('should error if no api key provided', () => {
      expect.assertions(1);
      return updateVersion.run({}).catch(err => {
        expect(err.message).toBe('No project API key provided. Please use `--key`.');
      });
    });

    it('should error if no version provided', () => {
      expect.assertions(1);
      return updateVersion.run({ key }).catch(err => {
        expect(err.message).toBe('Please specify a semantic version. See `rdme help versions:update` for help.');
      });
    });

    it('should update a specific version object', () => {
      promptHandler.createVersionPrompt.mockResolvedValue({
        is_stable: false,
        is_beta: false,
        is_deprecated: true,
      });

      const mockRequest = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .put(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(201, { version });

      return updateVersion.run({ key, version }).then(() => {
        mockRequest.done();
      });
    });

    it('should catch any put request errors', () => {
      expect.assertions(1);
      promptHandler.createVersionPrompt.mockResolvedValue({
        is_stable: false,
        is_beta: false,
      });

      const mockRequest = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .put(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(400, {
          error: 'VERSION_CANT_DEMOTE_STABLE',
          message: "You can't make a stable version non-stable",
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      return updateVersion.run({ key, version }).catch(err => {
        expect(err.message).toContain("You can't make a stable version non-stable");
        mockRequest.done();
      });
    });
  });
});
