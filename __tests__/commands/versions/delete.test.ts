import nock from 'nock';
import { describe, beforeAll, afterEach, it, expect } from 'vitest';

import Command from '../../../src/commands/versions/delete.js';
import { APIv1Error } from '../../../src/lib/apiError.js';
import { getAPIV1Mock } from '../../helpers/get-api-mock.js';
import { runCommandAndReturnResult } from '../../helpers/oclif.js';

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme versions:delete', () => {
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    nock.disableNetConnect();
    run = (args: string[]) => runCommandAndReturnResult(Command)(args);
  });

  afterEach(() => nock.cleanAll());

  it('should delete a specific version', async () => {
    const mockRequest = getAPIV1Mock()
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

    const mockRequest = getAPIV1Mock()
      .delete(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(404, errorResponse)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    await expect(run(['--key', key, version])).rejects.toStrictEqual(new APIv1Error(errorResponse));
    mockRequest.done();
  });
});
