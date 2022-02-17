const config = require('config');
const fetch = require('../../src/lib/fetch');
const { cleanHeaders, handleRes } = require('../../src/lib/fetch');
const getApiNock = require('../get-api-nock');
const pkg = require('../../package.json');

describe('#fetch()', () => {
  describe('GitHub Actions environment', () => {
    beforeEach(() => {
      process.env.GITHUB_ACTIONS = 'true';
    });

    afterEach(() => {
      delete process.env.GITHUB_ACTIONS;
    });

    it('should have correct headers for requests in GitHub Action env', async () => {
      const key = 'API_KEY';

      const mock = getApiNock()
        .get('/api/v1')
        .basicAuth({ user: key })
        .reply(200, function () {
          return this.req.headers;
        });

      const headers = await fetch(`${config.get('host')}/api/v1`, {
        method: 'get',
        headers: cleanHeaders(key),
      }).then(handleRes);

      expect(headers['user-agent'].shift()).toBe(`rdme-github/${pkg.version}`);
      expect(headers['x-readme-source'].shift()).toBe('cli-gh');
      mock.done();
    });
  });

  it('should wrap all requests with standard user-agent and source headers', async () => {
    const key = 'API_KEY';

    const mock = getApiNock()
      .get('/api/v1')
      .basicAuth({ user: key })
      .reply(200, function () {
        return this.req.headers;
      });

    const headers = await fetch(`${config.get('host')}/api/v1`, {
      method: 'get',
      headers: cleanHeaders(key),
    }).then(handleRes);

    expect(headers['user-agent'].shift()).toBe(`rdme/${pkg.version}`);
    expect(headers['x-readme-source'].shift()).toBe('cli');
    mock.done();
  });

  it('should support if we dont supply any other options with the request', async () => {
    const mock = getApiNock()
      .get('/api/v1/doesnt-need-auth')
      .reply(200, function () {
        return this.req.headers;
      });

    const headers = await fetch(`${config.get('host')}/api/v1/doesnt-need-auth`).then(handleRes);

    expect(headers['user-agent'].shift()).toBe(`rdme/${pkg.version}`);
    expect(headers['x-readme-source'].shift()).toBe('cli');
    mock.done();
  });
});

describe('#cleanHeaders()', () => {
  it('should base64-encode key in ReadMe-friendly format', () => {
    expect(cleanHeaders('test')).toStrictEqual({ Authorization: 'Basic dGVzdDo=' });
  });

  it('should filter out undefined headers', () => {
    expect(cleanHeaders('test', { 'x-readme-version': undefined })).toStrictEqual({ Authorization: 'Basic dGVzdDo=' });
  });

  it('should filter out null headers', () => {
    expect(cleanHeaders('test', { 'x-readme-version': undefined, Accept: null })).toStrictEqual({
      Authorization: 'Basic dGVzdDo=',
    });
  });

  it('should pass in properly defined headers', () => {
    expect(
      cleanHeaders('test', { 'x-readme-version': undefined, Accept: null, 'Content-Type': 'application/json' })
    ).toStrictEqual({
      Authorization: 'Basic dGVzdDo=',
      'Content-Type': 'application/json',
    });
  });
});
