import nock from 'nock';
import { describe, beforeAll, beforeEach, afterEach, it, expect } from 'vitest';

import Command from '../../../src/cmds/versions/delete.js';
import APIError from '../../../src/lib/apiError.js';
import getAPIMock from '../../helpers/get-api-mock.js';
import { runCommand } from '../../helpers/setup-oclif-config.js';

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme versions:delete', () => {
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    run = runCommand(Command);
  });

  afterEach(() => nock.cleanAll());

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
