import type { Config } from '@oclif/core';

import nock from 'nock';
import prompts from 'prompts';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi } from 'vitest';

import APIError from '../../../src/lib/apiError.js';
import getAPIMock from '../../helpers/get-api-mock.js';
import setupOclifConfig from '../../helpers/setup-oclif-config.js';

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme versions:delete', () => {
  let oclifConfig: Config;
  let run: (args?: string[]) => Promise<unknown>;

  beforeAll(() => {
    nock.disableNetConnect();
  });

  beforeEach(async () => {
    oclifConfig = await setupOclifConfig();
    run = (args?: string[]) => oclifConfig.runCommand('versions:delete', args);
  });

  afterEach(() => nock.cleanAll());

  it('should prompt for login if no API key provided', async () => {
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    prompts.inject(['this-is-not-an-email', 'password', 'subdomain']);
    await expect(run()).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
    consoleInfoSpy.mockRestore();
  });

  it('should error in CI if no API key provided', async () => {
    process.env.TEST_RDME_CI = 'true';
    await expect(run()).rejects.toStrictEqual(new Error('No project API key provided. Please use `--key`.'));
    delete process.env.TEST_RDME_CI;
  });

  it('should delete a specific version', async () => {
    const mockRequest = getAPIMock()
      .delete(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { removed: true })
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    await expect(run(['--key', key, version])).resolves.toBe('Version 1.0.0 deleted successfully.');
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

    const mockRequest = getAPIMock()
      .delete(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(404, errorResponse)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    await expect(run(['--key', key, version])).rejects.toThrow(new APIError(errorResponse));
    mockRequest.done();
  });
});
