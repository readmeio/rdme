const nock = require('nock');
const config = require('config');
const assert = require('assert');
const promptHandler = require('../lib/prompts');

const versions = require('../cli').bind(null, 'versions');
const createVersion = require('../cli').bind(null, 'versions:create');
const deleteVersion = require('../cli').bind(null, 'versions:delete');
const updateVersion = require('../cli').bind(null, 'versions:update');

jest.mock('../lib/prompts');
const key = 'Xmw4bGctRVIQz7R7dQXqH9nQe5d0SPQs';
const version = '1.0.0';

describe('Versions CLI Commands', () => {
  beforeAll(() => nock.disableNetConnect());
  afterEach(() => nock.cleanAll());

  describe('base command', () => {
    it('should error if no api key provided', () => {
      versions([], {}).catch(err => {
        assert.equal(err.message, 'No api key provided. Please use --key');
      });
    });

    it('should make a request to get a list of existing versions', async () => {
      const mockRequest = nock(config.host)
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [{ version }, { version }]);

      const versionsResponse = await versions([], { key });
      assert.equal(versionsResponse.length, 2);
      mockRequest.done();
    });

    it('should get a specific version object if version flag provided', async () => {
      const mockRequest = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await versions([], { key, version });
      mockRequest.done();
    });

    it('should catch any request errors', async () => {
      const mockRequest = nock(config.host)
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(400);

      await versions([], { key }).catch(err => {
        assert.equal(err.message, 'Failed to get version(s) attached to the provided key.');
      });
      mockRequest.done();
    });
  });

  describe('create new version', () => {
    it('should error if no api key provided', () => {
      createVersion([], {}).catch(err => {
        assert.equal(err.message, 'No api key provided. Please use --key');
      });
    });

    it('should error if no version provided', () => {
      createVersion([], { key }).catch(err => {
        assert.equal(
          err.message,
          'No version provided. Please specify a semantic version using --version',
        );
      });
    });

    it('should get a specific version object', async () => {
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

      await createVersion([], { key, version });
      mockRequest.done();
    });

    it('should catch any post request errors', async () => {
      promptHandler.createVersionPrompt.mockResolvedValue({
        is_stable: false,
        is_beta: false,
      });

      const mockRequest = nock(config.host)
        .post(`/api/v1/version`)
        .basicAuth({ user: key })
        .reply(400);

      await createVersion([], { key, version, fork: '0.0.5' }).catch(err => {
        assert.equal(
          err.message,
          'Failed to create a new version using your specified parameters.',
        );
      });
      mockRequest.done();
    });
  });

  describe('delete version', () => {
    it('should error if no api key provided', () => {
      deleteVersion([], {}).catch(err => {
        assert.equal(err.message, 'No api key provided. Please use --key');
      });
    });

    it('should error if no version provided', () => {
      deleteVersion([], { key }).catch(err => {
        assert.equal(
          err.message,
          'No version provided. Please specify a semantic version using --version',
        );
      });
    });

    it('should delete a specific version', async () => {
      const mockRequest = nock(config.host)
        .delete(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200);

      await deleteVersion([], { key, version });
      mockRequest.done();
    });

    it('should catch any request errors', async () => {
      const mockRequest = nock(config.host)
        .delete(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(400);

      await deleteVersion([], { key, version }).catch(err => {
        assert.equal(err.message, 'Failed to delete target version.');
      });
      mockRequest.done();
    });
  });

  describe('update version', () => {
    it('should error if no api key provided', () => {
      updateVersion([], {}).catch(err => {
        assert.equal(err.message, 'No api key provided. Please use --key');
      });
    });

    it('should error if no version provided', () => {
      updateVersion([], { key }).catch(err => {
        assert.equal(
          err.message,
          'No version provided. Please specify a semantic version using --version',
        );
      });
    });

    it('should get a specific version object', async () => {
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

      await updateVersion([], { key, version });
      mockRequest.done();
    });

    it('should catch any post request errors', async () => {
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
        .reply(400);

      await updateVersion([], { key, version }).catch(err => {
        assert.equal(err.message, 'Failed to update version using your specified parameters.');
      });
      mockRequest.done();
    });
  });
});
