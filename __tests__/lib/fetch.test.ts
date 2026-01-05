/** biome-ignore-all lint/suspicious/noConsole: We're testing console output. */
import type { MockInstance } from 'vitest';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import pkg from '../../package.json' with { type: 'json' };
import DocsUploadCommand from '../../src/commands/docs/upload.js';
import {
  cleanAPIv1Headers,
  fetchSchema,
  handleAPIv1Res,
  readmeAPIv1Fetch,
  readmeAPIv2Fetch,
} from '../../src/lib/readmeAPIFetch.js';
import { getAPIv1Mock, getAPIv2Mock } from '../helpers/get-api-mock.js';
import { githubActionsEnv } from '../helpers/git-mock.js';
import { setupOclifConfig } from '../helpers/oclif.js';

describe('#readmeAPIv1Fetch()', () => {
  describe('GitHub Actions environment', () => {
    beforeEach(() => {
      githubActionsEnv.before();
    });

    afterEach(() => {
      githubActionsEnv.after();
    });

    it('should have correct headers for requests in GitHub Action env', async () => {
      const key = 'API_KEY';

      const mock = getAPIv1Mock()
        .get('/api/v1')
        .basicAuth({ user: key })
        .reply(200, function () {
          return this.req.headers;
        });

      const headers = await readmeAPIv1Fetch('/api/v1', {
        method: 'get',
        headers: cleanAPIv1Headers(key),
      }).then(handleAPIv1Res);

      expect(headers['user-agent']).toBe(`rdme-github/${pkg.version}`);
      expect(headers['x-readme-source']).toBe('cli-gh');
      expect(headers['x-github-repository']).toBe('octocat/Hello-World');
      expect(headers['x-github-run-attempt']).toBe('3');
      expect(headers['x-github-run-id']).toBe('1658821493');
      expect(headers['x-github-run-number']).toBe('3');
      expect(headers['x-github-sha']).toBe('ffac537e6cbbf934b08745a378932722df287a53');
      expect(headers['x-rdme-ci']).toBe('GitHub Actions (test)');

      mock.done();
    });

    describe('source URL header', () => {
      it('should include source URL header with simple path', async () => {
        const key = 'API_KEY';

        const mock = getAPIv1Mock()
          .get('/api/v1')
          .basicAuth({ user: key })
          .reply(200, function () {
            return this.req.headers;
          });

        const headers = await readmeAPIv1Fetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanAPIv1Headers(key),
          },
          { filePath: 'openapi.json', fileType: 'path' },
        ).then(handleAPIv1Res);

        expect(headers['x-readme-source-url']).toBe(
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/openapi.json',
        );

        mock.done();
      });

      it('should include source URL header with path that contains weird characters', async () => {
        const key = 'API_KEY';

        const mock = getAPIv1Mock()
          .get('/api/v1')
          .basicAuth({ user: key })
          .reply(200, function () {
            return this.req.headers;
          });

        const headers = await readmeAPIv1Fetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanAPIv1Headers(key),
          },
          { filePath: './📈 Dashboard & Metrics/openapi.json', fileType: 'path' },
        ).then(handleAPIv1Res);

        expect(headers['x-readme-source-url']).toBe(
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/%F0%9F%93%88%20Dashboard%20&%20Metrics/openapi.json',
        );

        mock.done();
      });

      it('should omit source URL header if URL is invalid', async () => {
        const key = 'API_KEY';
        vi.stubEnv('GITHUB_SERVER_URL', undefined);

        const mock = getAPIv1Mock()
          .get('/api/v1')
          .basicAuth({ user: key })
          .reply(200, function () {
            return this.req.headers;
          });

        const headers = await readmeAPIv1Fetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanAPIv1Headers(key),
          },
          { filePath: './📈 Dashboard & Metrics/openapi.json', fileType: 'path' },
        ).then(handleAPIv1Res);

        expect(headers['x-readme-source-url']).toBeUndefined();

        mock.done();
      });

      it('should include source URL header with relative path', async () => {
        const key = 'API_KEY';

        const mock = getAPIv1Mock()
          .get('/api/v1')
          .basicAuth({ user: key })
          .reply(200, function () {
            return this.req.headers;
          });

        const headers = await readmeAPIv1Fetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanAPIv1Headers(key),
          },
          { filePath: './openapi.json', fileType: 'path' },
        ).then(handleAPIv1Res);

        expect(headers['x-readme-source-url']).toBe(
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/openapi.json',
        );

        mock.done();
      });

      it('should include source URL header with URL path', async () => {
        const key = 'API_KEY';
        const filePath = 'https://example.com/openapi.json';

        const mock = getAPIv1Mock()
          .get('/api/v1')
          .basicAuth({ user: key })
          .reply(200, function () {
            return this.req.headers;
          });

        const headers = await readmeAPIv1Fetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanAPIv1Headers(key),
          },
          { filePath, fileType: 'url' },
        ).then(handleAPIv1Res);

        expect(headers['x-readme-source-url']).toBe(filePath);

        mock.done();
      });
    });
  });

  it('should wrap all requests with standard user-agent and source headers', async () => {
    const key = 'API_KEY';

    const mock = getAPIv1Mock()
      .get('/api/v1')
      .basicAuth({ user: key })
      .reply(200, function () {
        return this.req.headers;
      });

    const headers = await readmeAPIv1Fetch('/api/v1', {
      method: 'get',
      headers: cleanAPIv1Headers(key),
    }).then(handleAPIv1Res);

    expect(headers['user-agent']).toBe(`rdme/${pkg.version}`);
    expect(headers['x-readme-source']).toBe('cli');
    expect(headers['x-github-repository']).toBeUndefined();
    expect(headers['x-github-run-attempt']).toBeUndefined();
    expect(headers['x-github-run-id']).toBeUndefined();
    expect(headers['x-github-run-number']).toBeUndefined();
    expect(headers['x-github-sha']).toBeUndefined();

    mock.done();
  });

  it('should make fetch call if no other request options are provided', async () => {
    const mock = getAPIv1Mock()
      .get('/api/v1/doesnt-need-auth')
      .reply(200, function () {
        return this.req.headers;
      });

    const headers = await readmeAPIv1Fetch('/api/v1/doesnt-need-auth').then(handleAPIv1Res);

    expect(headers['user-agent']).toBe(`rdme/${pkg.version}`);
    expect(headers['x-readme-source']).toBe('cli');
    expect(headers['x-github-repository']).toBeUndefined();
    expect(headers['x-github-run-attempt']).toBeUndefined();
    expect(headers['x-github-run-id']).toBeUndefined();
    expect(headers['x-github-run-number']).toBeUndefined();
    expect(headers['x-github-sha']).toBeUndefined();

    mock.done();
  });

  describe('warning response header', () => {
    let consoleWarnSpy: MockInstance<typeof console.warn>;

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
      const mock = getAPIv1Mock().get('/api/v1/some-warning').reply(200, undefined, {
        Warning: '',
      });

      await readmeAPIv1Fetch('/api/v1/some-warning');

      expect(console.warn).toHaveBeenCalledTimes(0);
      expect(getWarningCommandOutput()).toBe('');

      mock.done();
    });

    it('should surface a single warning header', async () => {
      const mock = getAPIv1Mock().get('/api/v1/some-warning').reply(200, undefined, {
        Warning: '199 - "some error"',
      });

      await readmeAPIv1Fetch('/api/v1/some-warning');

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(getWarningCommandOutput()).toBe('⚠️  ReadMe API Warning: some error');

      mock.done();
    });

    it('should surface multiple warning headers', async () => {
      const mock = getAPIv1Mock().get('/api/v1/some-warning').reply(200, undefined, {
        Warning: '199 - "some error" 199 - "another error"',
      });

      await readmeAPIv1Fetch('/api/v1/some-warning');

      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(getWarningCommandOutput()).toBe(
        '⚠️  ReadMe API Warning: some error\n\n⚠️  ReadMe API Warning: another error',
      );

      mock.done();
    });

    it('should surface header content even if parsing fails', async () => {
      const mock = getAPIv1Mock().get('/api/v1/some-warning').reply(200, undefined, {
        Warning: 'some garbage error',
      });

      await readmeAPIv1Fetch('/api/v1/some-warning');

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(getWarningCommandOutput()).toBe('⚠️  ReadMe API Warning: some garbage error');

      mock.done();
    });
  });

  /**
   * @note these tests aren't doing much since there's no way for nock to intercept proxy agents properly.
   * Undici has its own [`MockAgent`](https://undici.nodejs.org/#/docs/api/MockAgent) but I haven't figured out
   * how to get it working with [ProxyAgent](https://undici.nodejs.org/#/docs/api/ProxyAgent).
   */
  describe('proxies', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should support proxies via HTTPS_PROXY env variable', async () => {
      const proxy = 'https://proxy.example.com:5678';

      vi.stubEnv('HTTPS_PROXY', proxy);

      const mock = getAPIv1Mock({}).get('/api/v1/proxy').reply(200);

      await readmeAPIv1Fetch('/api/v1/proxy');

      expect(mock.isDone()).toBe(true);
    });

    it('should support proxies via https_proxy env variable', async () => {
      const proxy = 'https://proxy.example.com:5678';

      vi.stubEnv('https_proxy', proxy);

      const mock = getAPIv1Mock({}).get('/api/v1/proxy').reply(200);

      await readmeAPIv1Fetch('/api/v1/proxy');

      expect(mock.isDone()).toBe(true);
    });

    it('should handle trailing slash in proxy URL', async () => {
      const proxy = 'https://proxy.example.com:5678/';

      vi.stubEnv('https_proxy', proxy);

      const mock = getAPIv1Mock({}).get('/api/v1/proxy').reply(200);

      await readmeAPIv1Fetch('/api/v1/proxy');

      expect(mock.isDone()).toBe(true);
    });
  });
});

describe('#cleanAPIv1Headers()', () => {
  it('should base64-encode key in ReadMe-friendly format', () => {
    expect(Array.from(cleanAPIv1Headers('test'))).toStrictEqual([['authorization', 'Basic dGVzdDo=']]);
  });

  it('should filter out undefined headers', () => {
    expect(Array.from(cleanAPIv1Headers('test', undefined, new Headers({ 'x-something': undefined })))).toStrictEqual([
      ['authorization', 'Basic dGVzdDo='],
    ]);
  });

  it('should filter out null headers', () => {
    expect(
      Array.from(cleanAPIv1Headers('test', undefined, new Headers({ 'x-something': '1234', Accept: null }))),
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

    expect(Array.from(cleanAPIv1Headers('test', undefined, headers))).toStrictEqual([
      ['accept', 'text/plain'],
      ['authorization', 'Basic dGVzdDo='],
      ['content-type', 'application/json'],
      ['x-readme-version', '1234'],
    ]);
  });
});

describe('#fetchSchema', () => {
  it('should fetch the schema', async () => {
    const oclifConfig = await setupOclifConfig();
    const command = new DocsUploadCommand([], oclifConfig);
    const schema = fetchSchema.call(command);

    expect(schema.type).toBe('object');
  });
});

describe('#readmeAPIv2Fetch()', () => {
  describe('retry logic', () => {
    it('should retry on 5xx errors with exponential backoff', async () => {
      const oclifConfig = await setupOclifConfig();
      const command = new DocsUploadCommand([], oclifConfig);
      // Silence debug output during tests
      vi.spyOn(command, 'debug').mockImplementation(() => {});

      // First two requests return 502, third succeeds
      const mock = getAPIv2Mock()
        .get('/test-retry')
        .reply(502, 'Bad Gateway')
        .get('/test-retry')
        .reply(503, 'Service Unavailable')
        .get('/test-retry')
        .reply(200, { success: true });

      const res = await readmeAPIv2Fetch.call(command, '/test-retry', { method: 'get' });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toStrictEqual({ success: true });

      mock.done();
    });

    it('should return final response after exhausting all retries on persistent 5xx errors', async () => {
      const oclifConfig = await setupOclifConfig();
      const command = new DocsUploadCommand([], oclifConfig);
      vi.spyOn(command, 'debug').mockImplementation(() => {});

      // All requests return 502 (initial + 3 retries = 4 total)
      const mock = getAPIv2Mock()
        .get('/test-retry-fail')
        .reply(502, 'Bad Gateway')
        .get('/test-retry-fail')
        .reply(502, 'Bad Gateway')
        .get('/test-retry-fail')
        .reply(502, 'Bad Gateway')
        .get('/test-retry-fail')
        .reply(502, 'Bad Gateway');

      const res = await readmeAPIv2Fetch.call(command, '/test-retry-fail', { method: 'get' });

      // After all retries exhausted, should return the final 502 response
      expect(res.status).toBe(502);

      mock.done();
    });

    it('should not retry on 4xx errors', async () => {
      const oclifConfig = await setupOclifConfig();
      const command = new DocsUploadCommand([], oclifConfig);
      vi.spyOn(command, 'debug').mockImplementation(() => {});

      // Single 404 request - should not retry
      const mock = getAPIv2Mock().get('/test-no-retry').reply(404, { error: 'Not found' });

      const res = await readmeAPIv2Fetch.call(command, '/test-no-retry', { method: 'get' });

      expect(res.status).toBe(404);

      mock.done();
    });

    it('should succeed on first attempt when no errors occur', async () => {
      const oclifConfig = await setupOclifConfig();
      const command = new DocsUploadCommand([], oclifConfig);
      vi.spyOn(command, 'debug').mockImplementation(() => {});

      const mock = getAPIv2Mock().get('/test-success').reply(200, { data: 'test' });

      const res = await readmeAPIv2Fetch.call(command, '/test-success', { method: 'get' });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toStrictEqual({ data: 'test' });

      mock.done();
    });
  });
});
