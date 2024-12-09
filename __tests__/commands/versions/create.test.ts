import nock from 'nock';
import prompts from 'prompts';
import { describe, beforeAll, afterEach, it, expect } from 'vitest';

import Command from '../../../src/commands/versions/create.js';
import { APIv1Error } from '../../../src/lib/apiError.js';
import { getAPIv1Mock } from '../../helpers/get-api-mock.js';
import { runCommandAndReturnResult } from '../../helpers/oclif.js';

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme versions create', () => {
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    nock.disableNetConnect();
    run = runCommandAndReturnResult(Command);
  });

  afterEach(() => nock.cleanAll());

  it('should error if no version provided', () => {
    return expect(run(['--key', key])).rejects.toThrow('Missing 1 required arg:\nversion');
  });

  it('should error if invalid version provided', () => {
    return expect(run(['--key', key, 'test'])).rejects.toStrictEqual(
      new Error('Please specify a semantic version. See `rdme help versions create` for help.'),
    );
  });

  it('should create a specific version', async () => {
    prompts.inject([version, false, true, true, false]);
    const newVersion = '1.0.1';

    const mockRequest = getAPIv1Mock()
      .get('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, [{ version }, { version: '1.1.0' }])
      .post('/api/v1/version', {
        version: newVersion,
        is_stable: false,
        is_beta: true,
        from: '1.0.0',
        is_hidden: true,
        is_deprecated: false,
      })
      .basicAuth({ user: key })
      .reply(201, { version: newVersion });

    await expect(run(['--key', key, newVersion])).resolves.toBe(`Version ${newVersion} created successfully.`);
    mockRequest.done();
  });

  it('should create a specific version with options', async () => {
    const newVersion = '1.0.1';

    const mockRequest = getAPIv1Mock()
      .post('/api/v1/version', {
        version: newVersion,
        codename: 'test',
        from: '1.0.0',
        is_beta: false,
        is_deprecated: false,
        is_hidden: false,
        is_stable: false,
      })
      .basicAuth({ user: key })
      .reply(201, { version: newVersion });

    await expect(
      run([
        '--key',
        key,
        newVersion,
        '--fork',
        version,
        '--beta',
        'false',
        '--deprecated',
        'false',
        '--main',
        'false',
        '--codename',
        'test',
        '--hidden',
        'false',
      ]),
    ).resolves.toBe(`Version ${newVersion} created successfully.`);

    mockRequest.done();
  });

  it('should create successfully a main version', async () => {
    const newVersion = '1.0.1';

    const mockRequest = getAPIv1Mock()
      .post('/api/v1/version', {
        version: newVersion,
        from: '1.0.0',
        is_beta: false,
        is_stable: true,
      })
      .basicAuth({ user: key })
      .reply(201, { version: newVersion });

    await expect(
      run([
        '--key',
        key,
        newVersion,
        '--fork',
        version,
        '--beta',
        'false',
        '--main',
        'true',
        '--hidden',
        'true',
        '--deprecated',
        'true',
      ]),
    ).resolves.toBe(`Version ${newVersion} created successfully.`);

    mockRequest.done();
  });

  it('should catch any post request errors', async () => {
    const errorResponse = {
      error: 'VERSION_EMPTY',
      message: 'You need to include an x-readme-version header',
      suggestion: '...a suggestion to resolve the issue...',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    const mockRequest = getAPIv1Mock().post('/api/v1/version').basicAuth({ user: key }).reply(400, errorResponse);

    await expect(run(['--key', key, version, '--fork', '0.0.5'])).rejects.toStrictEqual(new APIv1Error(errorResponse));
    mockRequest.done();
  });

  describe('bad flag values', () => {
    it('should throw if non-boolean `beta` flag is passed', () => {
      const newVersion = '1.0.1';

      return expect(run(['--key', key, newVersion, '--fork', version, '--beta', 'test'])).rejects.toThrow(
        'Expected --beta=test to be one of: true, false',
      );
    });

    it('should throw if non-boolean `deprecated` flag is passed', () => {
      const newVersion = '1.0.1';

      return expect(run(['--key', key, newVersion, '--fork', version, '--deprecated', 'test'])).rejects.toThrow(
        'Expected --deprecated=test to be one of: true, false',
      );
    });

    it('should throw if non-boolean `hidden` flag is passed', () => {
      const newVersion = '1.0.1';

      return expect(run(['--key', key, newVersion, '--fork', version, '--hidden', 'test'])).rejects.toThrow(
        'Expected --hidden=test to be one of: true, false',
      );
    });

    it('should throw if non-boolean `main` flag is passed', () => {
      const newVersion = '1.0.1';

      return expect(run(['--key', key, newVersion, '--fork', version, '--main', 'test'])).rejects.toThrow(
        'Expected --main=test to be one of: true, false',
      );
    });
  });
});
