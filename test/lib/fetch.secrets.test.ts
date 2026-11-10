import { afterEach, describe, expect, it, vi } from 'vitest';

import DocsUploadCommand from '../../src/commands/docs/upload.js';
import * as logger from '../../src/lib/logger.js';
import { handleAPIv1Res, handleAPIv2Res, readmeAPIv1Fetch, readmeAPIv2Fetch } from '../../src/lib/readmeAPIFetch.js';
import { getAPIv1Mock, getAPIv2Mock, getAPIv2MockForGHA } from '../helpers/get-api-mock.js';
import { setupOclifConfig } from '../helpers/oclif.js';

/**
 * Runs `run` as if it were inside a GitHub Actions job and returns everything
 * written to stdout, including `::debug::` and `::add-mask::` workflow commands.
 */
async function withActionsLogs(run: () => Promise<void>) {
  const chunks: string[] = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = ((chunk: string | Uint8Array) => {
    chunks.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8'));
    return true;
  }) as typeof process.stdout.write;

  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('TEST_RDME_GHA', 'true');

  try {
    await run();
  } finally {
    process.stdout.write = originalWrite;
    vi.unstubAllEnvs();
  }

  return chunks.join('');
}

describe('fetch secret redaction', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('redacts credential fields in non-JSON debug output without changing the rejected body', async () => {
    const debugSpy = vi.spyOn(logger, 'debug').mockImplementation(() => {});
    const body = '{"apiKey":"rdme_dummy123"}';
    const mock = getAPIv1Mock().get('/api/v1/plain-secret').reply(500, body, {
      'Content-Type': 'text/plain',
    });

    const res = await readmeAPIv1Fetch('/api/v1/plain-secret');
    await expect(handleAPIv1Res(res)).rejects.toBe(body);

    const logged = debugSpy.mock.calls.map(call => String(call[0])).join('\n');
    expect(logged).not.toContain('rdme_dummy123');
    expect(logged).toContain('[REDACTED]');

    mock.done();
  });

  it('does not write a login API key to the GitHub Actions debug log', async () => {
    const apiKey = 'rdme_dummy123';

    const output = await withActionsLogs(async () => {
      const mock = getAPIv1Mock().post('/api/v1/login').reply(200, { apiKey, email: 'a@b.co' });
      const res = await readmeAPIv1Fetch('/api/v1/login', { method: 'post' });
      await expect(handleAPIv1Res(res)).resolves.toMatchObject({ apiKey, email: 'a@b.co' });
      mock.done();
    });

    const debugLog = output
      .split(/\r?\n/)
      .filter(line => line.includes('::debug::'))
      .join('\n');

    const maskAt = output.indexOf(`::add-mask::${apiKey}`);
    const responseDebugAt = output.indexOf('with JSON response:');
    expect(maskAt).toBeGreaterThanOrEqual(0);
    expect(responseDebugAt).toBeGreaterThan(maskAt);
    expect(debugLog).not.toContain(apiKey);
    expect(debugLog).toContain('[REDACTED]');
    expect(debugLog).toContain('a@b.co');
  });

  it('redacts credential fields in JSON debug output', async () => {
    const oclifConfig = await setupOclifConfig();
    const command = new DocsUploadCommand([], oclifConfig);
    const apiKey = 'rdme_dummy123';

    const output = await withActionsLogs(async () => {
      const mock = getAPIv2MockForGHA().get('/secret').reply(200, { apiKey, name: 'owl' });
      const res = await readmeAPIv2Fetch.call(command, '/secret', { method: 'get' });
      await expect(handleAPIv2Res.call(command, res)).resolves.toMatchObject({ apiKey, name: 'owl' });
      mock.done();
    });

    const debugLog = output
      .split(/\r?\n/)
      .filter(line => line.includes('::debug::'))
      .join('\n');

    expect(debugLog).not.toContain(apiKey);
    expect(debugLog).toContain('[REDACTED]');
    expect(debugLog).toContain('owl');
  });

  it('redacts credential fields in retry previews', async () => {
    const oclifConfig = await setupOclifConfig();
    const command = new DocsUploadCommand([], oclifConfig);
    const debugSpy = vi.spyOn(command, 'debug').mockImplementation(() => {});
    const apiKey = 'rdme_dummy123';
    const mock = getAPIv2Mock()
      .get('/retry-secret')
      .reply(500, { apiKey, error: 'unavailable' })
      .get('/retry-secret')
      .reply(200, { ok: true });

    const res = await readmeAPIv2Fetch.call(command, '/retry-secret', { method: 'get' }, { retries: 1 });
    expect(res.status).toBe(200);

    const logged = debugSpy.mock.calls.map(call => call.map(String).join(' ')).join('\n');
    expect(logged).not.toContain(apiKey);
    expect(logged).toContain('[REDACTED]');

    mock.done();
  });
});
