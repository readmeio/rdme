const config = require('config');
const fetch = require('../../src/lib/fetch');
const { cleanHeaders, handleRes } = require('../../src/lib/fetch');
const getApiNock = require('../get-api-nock');
const pkg = require('../../package.json');

describe('#fetch()', () => {
  describe('GitHub Actions environment', () => {
    // List of all GitHub Actions env variables:
    // https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
    beforeEach(() => {
      process.env.GITHUB_ACTIONS = 'true';
      process.env.GITHUB_REPOSITORY = 'octocat/Hello-World';
      process.env.GITHUB_RUN_ATTEMPT = '3';
      process.env.GITHUB_RUN_ID = '1658821493';
      process.env.GITHUB_RUN_NUMBER = '3';
      process.env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
    });

    afterEach(() => {
      delete process.env.GITHUB_ACTIONS;
      delete process.env.GITHUB_REPOSITORY;
      delete process.env.GITHUB_RUN_ATTEMPT;
      delete process.env.GITHUB_RUN_ID;
      delete process.env.GITHUB_RUN_NUMBER;
      delete process.env.GITHUB_SHA;
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
      expect(headers['x-github-repository'].shift()).toBe('octocat/Hello-World');
      expect(headers['x-github-run-attempt'].shift()).toBe('3');
      expect(headers['x-github-run-id'].shift()).toBe('1658821493');
      expect(headers['x-github-run-number'].shift()).toBe('3');
      expect(headers['x-github-sha'].shift()).toBe('ffac537e6cbbf934b08745a378932722df287a53');
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
    expect(headers['x-github-repository']).toBeUndefined();
    expect(headers['x-github-run-attempt']).toBeUndefined();
    expect(headers['x-github-run-id']).toBeUndefined();
    expect(headers['x-github-run-number']).toBeUndefined();
    expect(headers['x-github-sha']).toBeUndefined();
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
    expect(headers['x-github-repository']).toBeUndefined();
    expect(headers['x-github-run-attempt']).toBeUndefined();
    expect(headers['x-github-run-id']).toBeUndefined();
    expect(headers['x-github-run-number']).toBeUndefined();
    expect(headers['x-github-sha']).toBeUndefined();
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
