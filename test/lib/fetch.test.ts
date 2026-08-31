import type { MockInstance } from 'vitest';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import pkg from '../../package.json' with { type: 'json' };
import DocsUploadCommand from '../../src/commands/docs/upload.js';
import { APIv1Error, APIv2Error } from '../../src/lib/apiError.js';
import {
  cleanAPIv1Headers,
  emptyMappings,
  fetchMappings,
  fetchSchema,
  handleAPIv1Res,
  handleAPIv2Res,
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
        .reply(200, function mock() {
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
          .reply(200, function mock() {
            return this.req.headers;
          });

        const headers = await readmeAPIv1Fetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanAPIv1Headers(key),
          },
          {
            file: { path: 'openapi.json', type: 'path' },
          },
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
          .reply(200, function mock() {
            return this.req.headers;
          });

        const headers = await readmeAPIv1Fetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanAPIv1Headers(key),
          },
          {
            file: { path: './📈 Dashboard & Metrics/openapi.json', type: 'path' },
          },
        ).then(handleAPIv1Res);

        expect(headers['x-readme-source-url']).toBe(
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/%F0%9F%93%88%20Dashboard%20&%20Metrics/openapi.json',
        );

        mock.done();
      });

      it('should omit source URL header if URL is invalid', async () => {
        const key = 'API_KEY';
        // oxlint-disable-next-line unicorn/no-useless-undefined
        vi.stubEnv('GITHUB_SERVER_URL', undefined);

        const mock = getAPIv1Mock()
          .get('/api/v1')
          .basicAuth({ user: key })
          .reply(200, function mock() {
            return this.req.headers;
          });

        const headers = await readmeAPIv1Fetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanAPIv1Headers(key),
          },
          {
            file: { path: './📈 Dashboard & Metrics/openapi.json', type: 'path' },
          },
        ).then(handleAPIv1Res);

        expect(headers['x-readme-source-url']).toBeUndefined();

        mock.done();
      });

      it('should include source URL header with relative path', async () => {
        const key = 'API_KEY';

        const mock = getAPIv1Mock()
          .get('/api/v1')
          .basicAuth({ user: key })
          .reply(200, function mock() {
            return this.req.headers;
          });

        const headers = await readmeAPIv1Fetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanAPIv1Headers(key),
          },
          {
            file: { path: './openapi.json', type: 'path' },
          },
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
          .reply(200, function mock() {
            return this.req.headers;
          });

        const headers = await readmeAPIv1Fetch(
          '/api/v1',
          {
            method: 'get',
            headers: cleanAPIv1Headers(key),
          },
          {
            file: { path: filePath, type: 'url' },
          },
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
      .reply(200, function mock() {
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
      .reply(200, function mock() {
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

describe('#fetchMappings', () => {
  it('should skip the mappings request when no API key is present', async () => {
    const oclifConfig = await setupOclifConfig();
    const command = new DocsUploadCommand([], oclifConfig);
    command.flags = { key: '' } as typeof command.flags;
    vi.spyOn(command, 'debug').mockImplementation(() => {});

    await expect(fetchMappings.call(command)).resolves.toStrictEqual(emptyMappings);
  });

  it('should return mappings from a successful migration API response', async () => {
    const oclifConfig = await setupOclifConfig();
    const command = new DocsUploadCommand([], oclifConfig);
    command.flags = { key: 'API_KEY' } as typeof command.flags;
    vi.spyOn(command, 'debug').mockImplementation(() => {});

    const mappings = {
      categories: { '5f92cbf10cf217478ba93561': 'getting-started' },
      parentPages: { abc: 'parent-slug' },
    };
    const mock = getAPIv1Mock().get('/api/v1/migration').basicAuth({ user: 'API_KEY' }).reply(200, mappings);

    await expect(fetchMappings.call(command)).resolves.toStrictEqual(mappings);

    mock.done();
  });

  it('should fall back to empty mappings when the migration API returns an error', async () => {
    const oclifConfig = await setupOclifConfig();
    const command = new DocsUploadCommand([], oclifConfig);
    command.flags = { key: 'API_KEY' } as typeof command.flags;
    vi.spyOn(command, 'debug').mockImplementation(() => {});

    const mock = getAPIv1Mock().get('/api/v1/migration').basicAuth({ user: 'API_KEY' }).reply(401, { error: 'denied' });

    await expect(fetchMappings.call(command)).resolves.toStrictEqual(emptyMappings);

    mock.done();
  });

  it('should fall back to empty mappings when the mappings request throws', async () => {
    const oclifConfig = await setupOclifConfig();
    const command = new DocsUploadCommand([], oclifConfig);
    command.flags = { key: 'API_KEY' } as typeof command.flags;
    vi.spyOn(command, 'debug').mockImplementation(() => {});

    const mock = getAPIv1Mock().get('/api/v1/migration').basicAuth({ user: 'API_KEY' }).replyWithError('ECONNRESET');

    await expect(fetchMappings.call(command)).resolves.toStrictEqual(emptyMappings);

    mock.done();
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

    it('should not retry when retries is 0', async () => {
      const oclifConfig = await setupOclifConfig();
      const command = new DocsUploadCommand([], oclifConfig);
      vi.spyOn(command, 'debug').mockImplementation(() => {});

      const mock = getAPIv2Mock().get('/test-no-retries').reply(502, 'Bad Gateway');

      const res = await readmeAPIv2Fetch.call(command, '/test-no-retries', { method: 'get' }, { retries: 0 });

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

    it('should retry on network failures and succeed', async () => {
      const oclifConfig = await setupOclifConfig();
      const command = new DocsUploadCommand([], oclifConfig);
      vi.spyOn(command, 'debug').mockImplementation(() => {});

      const mock = getAPIv2Mock()
        .get('/test-network')
        .replyWithError('ECONNRESET')
        .get('/test-network')
        .replyWithError('ECONNRESET')
        .get('/test-network')
        .reply(200, { recovered: true });

      const res = await readmeAPIv2Fetch.call(command, '/test-network', { method: 'get' });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toStrictEqual({ recovered: true });

      mock.done();
    });

    it('should throw after exhausting retries on persistent network failures', async () => {
      const oclifConfig = await setupOclifConfig();
      const command = new DocsUploadCommand([], oclifConfig);
      vi.spyOn(command, 'debug').mockImplementation(() => {});

      const mock = getAPIv2Mock().get('/test-network-fail').times(4).replyWithError('ECONNRESET');

      await expect(readmeAPIv2Fetch.call(command, '/test-network-fail', { method: 'get' })).rejects.toThrow(
        /ECONNRESET/,
      );

      mock.done();
    });
  });
});

describe('#handleAPIv1Res', () => {
  it('returns an empty object for 204 responses', async () => {
    const mock = getAPIv1Mock().delete('/api/v1/empty').reply(204);

    const res = await readmeAPIv1Fetch('/api/v1/empty', { method: 'delete' });

    await expect(handleAPIv1Res(res)).resolves.toStrictEqual({});

    mock.done();
  });

  it('throws APIv1Error when the JSON body contains an error', async () => {
    const mock = getAPIv1Mock().get('/api/v1/err').reply(400, {
      error: 'LOGIN_INVALID',
      message: 'Either your email address or password is incorrect',
      help: 'If you need help, email support@readme.io.',
    });

    const res = await readmeAPIv1Fetch('/api/v1/err');

    await expect(handleAPIv1Res(res)).rejects.toBeInstanceOf(APIv1Error);

    mock.done();
  });

  it('returns the JSON body when rejectOnJsonError is false', async () => {
    const body = {
      error: 'LOGIN_TWOFACTOR',
      message: 'You must provide a two-factor code',
    };
    const mock = getAPIv1Mock().get('/api/v1/2fa').reply(401, body);

    const res = await readmeAPIv1Fetch('/api/v1/2fa');

    await expect(handleAPIv1Res(res, false)).resolves.toMatchObject(body);

    mock.done();
  });

  it('throws a generic error when the JSON body cannot be parsed', async () => {
    const mock = getAPIv1Mock().get('/api/v1/bad-json').reply(200, 'not-json', {
      'Content-Type': 'application/json',
    });

    const res = await readmeAPIv1Fetch('/api/v1/bad-json');

    await expect(handleAPIv1Res(res)).rejects.toThrow('The ReadMe API responded with an unexpected error');

    mock.done();
  });

  it('rejects non-JSON response bodies', async () => {
    const mock = getAPIv1Mock().get('/api/v1/plain').reply(500, 'gateway exploded', {
      'Content-Type': 'text/plain',
    });

    const res = await readmeAPIv1Fetch('/api/v1/plain');

    await expect(handleAPIv1Res(res)).rejects.toBe('gateway exploded');

    mock.done();
  });
});

describe('#handleAPIv2Res', () => {
  it('returns an empty object for 204 responses', async () => {
    const oclifConfig = await setupOclifConfig();
    const command = new DocsUploadCommand([], oclifConfig);
    vi.spyOn(command, 'debug').mockImplementation(() => {});

    const mock = getAPIv2Mock().delete('/empty').reply(204);

    const res = await readmeAPIv2Fetch.call(command, '/empty', { method: 'delete' });

    await expect(handleAPIv2Res.call(command, res)).resolves.toStrictEqual({});

    mock.done();
  });

  it('throws APIv2Error for unsuccessful JSON responses', async () => {
    const oclifConfig = await setupOclifConfig();
    const command = new DocsUploadCommand([], oclifConfig);
    vi.spyOn(command, 'debug').mockImplementation(() => {});

    const mock = getAPIv2Mock().get('/err').reply(422, {
      title: 'Validation failed',
      detail: 'The page could not be saved.',
    });

    const res = await readmeAPIv2Fetch.call(command, '/err', { method: 'get' });

    await expect(handleAPIv2Res.call(command, res)).rejects.toBeInstanceOf(APIv2Error);

    mock.done();
  });

  it('throws a generic error when the JSON body cannot be parsed', async () => {
    const oclifConfig = await setupOclifConfig();
    const command = new DocsUploadCommand([], oclifConfig);
    vi.spyOn(command, 'debug').mockImplementation(() => {});

    const mock = getAPIv2Mock().get('/bad-json').reply(200, 'not-json', {
      'Content-Type': 'application/json',
    });

    const res = await readmeAPIv2Fetch.call(command, '/bad-json', { method: 'get' });

    await expect(handleAPIv2Res.call(command, res)).rejects.toThrow(
      'The ReadMe API responded with an unexpected error',
    );

    mock.done();
  });

  it('throws a generic error for non-JSON responses', async () => {
    const oclifConfig = await setupOclifConfig();
    const command = new DocsUploadCommand([], oclifConfig);
    vi.spyOn(command, 'debug').mockImplementation(() => {});

    const res = new Response('gateway exploded', {
      status: 200,
      headers: { 'content-type': '' },
    });

    await expect(handleAPIv2Res.call(command, res)).rejects.toThrow(
      'The ReadMe API responded with an unexpected error',
    );
  });
});
