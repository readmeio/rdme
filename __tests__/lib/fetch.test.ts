/* eslint-disable no-console */
import { Headers } from 'node-fetch';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import pkg from '../../package.json';
import readmeAPIFetch, { cleanHeaders, handleRes } from '../../src/lib/readmeAPIFetch';
import getAPIMock from '../helpers/get-api-mock';
import { after, before } from '../helpers/setup-gha-env';

describe('#fetch()', () => {
  describe('GitHub Actions environment', () => {
    beforeEach(before);

    afterEach(after);

    it('should have correct headers for requests in GitHub Action env', async () => {
      const key = 'API_KEY';

      const mock = getAPIMock()
        .get('/api/v1')
        .basicAuth({ user: key })
        .reply(200, function () {
          return this.req.headers;
        });

      const headers = await readmeAPIFetch('/api/v1', {
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
      expect(headers['x-rdme-ci'].shift()).toBe('GitHub Actions (test)');
      mock.done();
    });

    describe('source URL header', () => {
      it('should include source URL header with simple path', async () => {
        const key = 'API_KEY';

        const mock = getAPIMock()
          .get('/api/v1')
          .basicAuth({ user: key })
          .reply(200, function () {
            return this.req.headers;
          });

        const headers = await readmeAPIFetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanHeaders(key),
          },
          { filePath: 'openapi.json', fileType: 'path' },
        ).then(handleRes);

        expect(headers['x-readme-source-url'].shift()).toBe(
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/openapi.json',
        );
        mock.done();
      });

      it('should include source URL header with path that contains weird characters', async () => {
        const key = 'API_KEY';

        const mock = getAPIMock()
          .get('/api/v1')
          .basicAuth({ user: key })
          .reply(200, function () {
            return this.req.headers;
          });

        const headers = await readmeAPIFetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanHeaders(key),
          },
          { filePath: './📈 Dashboard & Metrics/openapi.json', fileType: 'path' },
        ).then(handleRes);

        expect(headers['x-readme-source-url'].shift()).toBe(
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/%F0%9F%93%88%20Dashboard%20&%20Metrics/openapi.json',
        );
        mock.done();
      });

      it('should omit source URL header if URL is invalid', async () => {
        const key = 'API_KEY';
        vi.stubEnv('GITHUB_SERVER_URL', undefined);

        const mock = getAPIMock()
          .get('/api/v1')
          .basicAuth({ user: key })
          .reply(200, function () {
            return this.req.headers;
          });

        const headers = await readmeAPIFetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanHeaders(key),
          },
          { filePath: './📈 Dashboard & Metrics/openapi.json', fileType: 'path' },
        ).then(handleRes);

        expect(headers['x-readme-source-url']).toBeUndefined();
        mock.done();
      });

      it('should include source URL header with relative path', async () => {
        const key = 'API_KEY';

        const mock = getAPIMock()
          .get('/api/v1')
          .basicAuth({ user: key })
          .reply(200, function () {
            return this.req.headers;
          });

        const headers = await readmeAPIFetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanHeaders(key),
          },
          { filePath: './openapi.json', fileType: 'path' },
        ).then(handleRes);

        expect(headers['x-readme-source-url'].shift()).toBe(
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/openapi.json',
        );
        mock.done();
      });

      it('should include source URL header with URL path', async () => {
        const key = 'API_KEY';
        const filePath = 'https://example.com/openapi.json';

        const mock = getAPIMock()
          .get('/api/v1')
          .basicAuth({ user: key })
          .reply(200, function () {
            return this.req.headers;
          });

        const headers = await readmeAPIFetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanHeaders(key),
          },
          { filePath, fileType: 'url' },
        ).then(handleRes);

        expect(headers['x-readme-source-url'].shift()).toBe(filePath);
        mock.done();
      });
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

    const headers = await readmeAPIFetch('/api/v1', {
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

    const headers = await readmeAPIFetch('/api/v1/doesnt-need-auth').then(handleRes);

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
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('should not log anything if no warning header was passed', async () => {
      const mock = getAPIMock().get('/api/v1/some-warning').reply(200, undefined, {
        Warning: '',
      });

      await readmeAPIFetch('/api/v1/some-warning');

      expect(console.warn).toHaveBeenCalledTimes(0);
      expect(getWarningCommandOutput()).toBe('');

      mock.done();
    });

    it('should surface a single warning header', async () => {
      const mock = getAPIMock().get('/api/v1/some-warning').reply(200, undefined, {
        Warning: '199 - "some error"',
      });

      await readmeAPIFetch('/api/v1/some-warning');

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(getWarningCommandOutput()).toBe('⚠️  ReadMe API Warning: some error');

      mock.done();
    });

    it('should surface multiple warning headers', async () => {
      const mock = getAPIMock().get('/api/v1/some-warning').reply(200, undefined, {
        Warning: '199 - "some error" 199 - "another error"',
      });

      await readmeAPIFetch('/api/v1/some-warning');

      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(getWarningCommandOutput()).toBe(
        '⚠️  ReadMe API Warning: some error\n\n⚠️  ReadMe API Warning: another error',
      );

      mock.done();
    });

    it('should surface header content even if parsing fails', async () => {
      const mock = getAPIMock().get('/api/v1/some-warning').reply(200, undefined, {
        Warning: 'some garbage error',
      });

      await readmeAPIFetch('/api/v1/some-warning');

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(getWarningCommandOutput()).toBe('⚠️  ReadMe API Warning: some garbage error');

      mock.done();
    });
  });

  describe('proxies', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should support proxies via HTTPS_PROXY env variable', async () => {
      const proxy = 'https://proxy.example.com:5678';

      vi.stubEnv('HTTPS_PROXY', proxy);

      const mock = getAPIMock({}, `${proxy}/`).get('/api/v1/proxy').reply(200);

      await readmeAPIFetch('/api/v1/proxy');

      expect(mock.isDone()).toBe(true);
    });

    it('should support proxies via https_proxy env variable', async () => {
      const proxy = 'https://proxy.example.com:5678';

      vi.stubEnv('https_proxy', proxy);

      const mock = getAPIMock({}, `${proxy}/`).get('/api/v1/proxy').reply(200);

      await readmeAPIFetch('/api/v1/proxy');

      expect(mock.isDone()).toBe(true);
    });

    it('should handle trailing slash in proxy URL', async () => {
      const proxy = 'https://proxy.example.com:5678/';

      vi.stubEnv('https_proxy', proxy);

      const mock = getAPIMock({}, proxy).get('/api/v1/proxy').reply(200);

      await readmeAPIFetch('/api/v1/proxy');

      expect(mock.isDone()).toBe(true);
    });
  });
});

describe('#cleanHeaders()', () => {
  it('should base64-encode key in ReadMe-friendly format', () => {
    expect(Array.from(cleanHeaders('test'))).toStrictEqual([['authorization', 'Basic dGVzdDo=']]);
  });

  it('should filter out undefined headers', () => {
    expect(Array.from(cleanHeaders('test', undefined, new Headers({ 'x-something': undefined })))).toStrictEqual([
      ['authorization', 'Basic dGVzdDo='],
    ]);
  });

  it('should filter out null headers', () => {
    expect(
      Array.from(cleanHeaders('test', undefined, new Headers({ 'x-something': '1234', Accept: null }))),
    ).toStrictEqual([
      ['authorization', 'Basic dGVzdDo='],
      ['x-something', '1234'],
    ]);
  });

  it('should pass in properly defined headers', () => {
    const headers = new Headers({
      'x-readme-version': '1234',
      Accept: 'text/plain',
      'Content-Type': 'application/json',
    });

    expect(Array.from(cleanHeaders('test', undefined, headers))).toStrictEqual([
      ['authorization', 'Basic dGVzdDo='],
      ['accept', 'text/plain'],
      ['content-type', 'application/json'],
      ['x-readme-version', '1234'],
    ]);
  });
});
