/* eslint-disable @typescript-eslint/ban-ts-comment, no-console */
import config from 'config';
import { Headers } from 'node-fetch';

import pkg from '../../package.json';
import fetch, { cleanHeaders, handleRes } from '../../src/lib/fetch';
import * as isCI from '../../src/lib/isCI';
import getAPIMock from '../helpers/get-api-mock';

describe('#fetch()', () => {
  describe('GitHub Actions environment', () => {
    let spy: jest.SpyInstance;

    // List of all GitHub Actions env variables:
    // https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
    beforeEach(() => {
      process.env.GITHUB_ACTION = '__repo-owner_name-of-action-repo';
      process.env.GITHUB_ACTIONS = 'true';
      process.env.GITHUB_REPOSITORY = 'octocat/Hello-World';
      process.env.GITHUB_RUN_ATTEMPT = '3';
      process.env.GITHUB_RUN_ID = '1658821493';
      process.env.GITHUB_RUN_NUMBER = '3';
      process.env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
      process.env.TEST_RDME_CI = 'true';
      spy = jest.spyOn(isCI, 'isGHA');
      spy.mockReturnValue(true);
    });

    afterEach(() => {
      delete process.env.GITHUB_ACTION;
      delete process.env.GITHUB_ACTIONS;
      delete process.env.GITHUB_REPOSITORY;
      delete process.env.GITHUB_RUN_ATTEMPT;
      delete process.env.GITHUB_RUN_ID;
      delete process.env.GITHUB_RUN_NUMBER;
      delete process.env.GITHUB_SHA;
      delete process.env.TEST_RDME_CI;
      spy.mockReset();
    });

    it('should have correct headers for requests in GitHub Action env', async () => {
      const key = 'API_KEY';

      const mock = getAPIMock()
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

    const mock = getAPIMock()
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

  it('should make fetch call if no other request options are provided', async () => {
    const mock = getAPIMock()
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

  describe('warning response header', () => {
    let consoleWarnSpy;

    const getWarningCommandOutput = () => {
      return [consoleWarnSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
    };

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('should not log anything if no warning header was passed', async () => {
      const mock = getAPIMock().get('/api/v1/some-warning').reply(200, undefined, {
        Warning: '',
      });

      await fetch(`${config.get('host')}/api/v1/some-warning`);

      expect(console.warn).toHaveBeenCalledTimes(0);
      expect(getWarningCommandOutput()).toBe('');

      mock.done();
    });

    it('should surface a single warning header', async () => {
      const mock = getAPIMock().get('/api/v1/some-warning').reply(200, undefined, {
        Warning: '199 - "some error"',
      });

      await fetch(`${config.get('host')}/api/v1/some-warning`);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(getWarningCommandOutput()).toBe('⚠️  ReadMe API Warning: some error');

      mock.done();
    });

    it('should surface multiple warning headers', async () => {
      const mock = getAPIMock().get('/api/v1/some-warning').reply(200, undefined, {
        Warning: '199 - "some error" 199 - "another error"',
      });

      await fetch(`${config.get('host')}/api/v1/some-warning`);

      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(getWarningCommandOutput()).toBe(
        '⚠️  ReadMe API Warning: some error\n\n⚠️  ReadMe API Warning: another error'
      );

      mock.done();
    });

    it('should surface header content even if parsing fails', async () => {
      const mock = getAPIMock().get('/api/v1/some-warning').reply(200, undefined, {
        Warning: 'some garbage error',
      });

      await fetch(`${config.get('host')}/api/v1/some-warning`);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(getWarningCommandOutput()).toBe('⚠️  ReadMe API Warning: some garbage error');

      mock.done();
    });
  });

  describe('proxies', () => {
    afterEach(() => {
      delete process.env.https_proxy;
      delete process.env.HTTPS_PROXY;
    });

    it('should support proxies via HTTPS_PROXY env variable', async () => {
      const proxy = 'https://proxy.example.com:5678';

      process.env.HTTPS_PROXY = proxy;

      const mock = getAPIMock({}, `${proxy}/`).get('/api/v1/proxy').reply(200);

      await fetch(`${config.get('host')}/api/v1/proxy`);

      expect(mock.isDone()).toBe(true);
    });

    it('should support proxies via https_proxy env variable', async () => {
      const proxy = 'https://proxy.example.com:5678';

      process.env.https_proxy = proxy;

      const mock = getAPIMock({}, `${proxy}/`).get('/api/v1/proxy').reply(200);

      await fetch(`${config.get('host')}/api/v1/proxy`);

      expect(mock.isDone()).toBe(true);
    });

    it('should handle trailing slash in proxy URL', async () => {
      const proxy = 'https://proxy.example.com:5678/';

      process.env.https_proxy = proxy;

      const mock = getAPIMock({}, proxy).get('/api/v1/proxy').reply(200);

      await fetch(`${config.get('host')}/api/v1/proxy`);

      expect(mock.isDone()).toBe(true);
    });
  });
});

describe('#cleanHeaders()', () => {
  it('should base64-encode key in ReadMe-friendly format', () => {
    expect(Array.from(cleanHeaders('test'))).toStrictEqual([['authorization', 'Basic dGVzdDo=']]);
  });

  it('should filter out undefined headers', () => {
    expect(
      // @ts-ignore Testing a quirk of `node-fetch`.
      Array.from(cleanHeaders('test', new Headers({ 'x-readme-version': undefined })))
    ).toStrictEqual([['authorization', 'Basic dGVzdDo=']]);
  });

  it('should filter out null headers', () => {
    expect(
      // @ts-ignore Testing a quirk of `node-fetch`.
      Array.from(cleanHeaders('test', new Headers({ 'x-readme-version': '1234', Accept: null })))
    ).toStrictEqual([
      ['authorization', 'Basic dGVzdDo='],
      ['x-readme-version', '1234'],
    ]);
  });

  it('should pass in properly defined headers', () => {
    const headers = new Headers({
      'x-readme-version': '1234',
      Accept: 'text/plain',
      'Content-Type': 'application/json',
    });

    expect(Array.from(cleanHeaders('test', headers))).toStrictEqual([
      ['authorization', 'Basic dGVzdDo='],
      ['accept', 'text/plain'],
      ['content-type', 'application/json'],
      ['x-readme-version', '1234'],
    ]);
  });
});
