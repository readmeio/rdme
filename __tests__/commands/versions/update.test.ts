import nock from 'nock';
import prompts from 'prompts';
import { describe, beforeAll, afterEach, it, expect } from 'vitest';

import Command from '../../../src/commands/versions/update.js';
import APIError from '../../../src/lib/apiError.js';
import getAPIMock from '../../helpers/get-api-mock.js';
import { runCommand } from '../../helpers/setup-oclif-config.js';

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme versions:update', () => {
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    nock.disableNetConnect();
    run = runCommand(Command);
  });

  afterEach(() => nock.cleanAll());

  it('should update a specific version object using prompts', async () => {
    const versionToChange = '1.1.0';
    prompts.inject([versionToChange, undefined, false, true, false, false]);

    const updatedVersionObject = {
      version: versionToChange,
      is_stable: false,
      is_beta: true,
      is_deprecated: false,
      is_hidden: false,
    };

    const mockRequest = getAPIMock()
      .get('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, [{ version }, { version: versionToChange }])
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange })
      .put(`/api/v1/version/${versionToChange}`, updatedVersionObject)
      .basicAuth({ user: key })
      .reply(201, updatedVersionObject);

    await expect(run(['--key', key])).resolves.toBe(`Version ${versionToChange} updated successfully.`);
    mockRequest.done();
  });

  it('should rename a specific version object using prompts', async () => {
    const versionToChange = '1.1.0';
    const renamedVersion = '1.1.0-update';
    prompts.inject([versionToChange, renamedVersion, false, true, false, false]);

    const updatedVersionObject = {
      version: renamedVersion,
      is_stable: false,
      is_beta: true,
      is_deprecated: false,
      is_hidden: false,
    };

    const mockRequest = getAPIMock()
      .get('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, [{ version }, { version: versionToChange }])
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange })
      .put(`/api/v1/version/${versionToChange}`, updatedVersionObject)
      .basicAuth({ user: key })
      .reply(201, updatedVersionObject);

    await expect(run(['--key', key])).resolves.toBe(`Version ${versionToChange} updated successfully.`);
    mockRequest.done();
  });

  it('should use subset of prompts when updating stable version', async () => {
    const versionToChange = '1.1.0';
    prompts.inject([versionToChange, undefined, true]);

    const updatedVersionObject = {
      version: versionToChange,
      is_beta: true,
    };

    const mockRequest = getAPIMock()
      .get('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, [{ version }, { version: versionToChange, is_stable: true }])
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange, is_stable: true })
      .put(`/api/v1/version/${versionToChange}`, updatedVersionObject)
      .basicAuth({ user: key })
      .reply(201, updatedVersionObject);

    await expect(run(['--key', key])).resolves.toBe(`Version ${versionToChange} updated successfully.`);
    mockRequest.done();
  });

  it('should update a specific version object using flags', async () => {
    const versionToChange = '1.1.0';
    const renamedVersion = '1.1.0-update';

    const updatedVersionObject = {
      codename: 'updated-test',
      version: renamedVersion,
      is_beta: true,
      is_deprecated: true,
      is_hidden: false,
      is_stable: false,
    };

    const mockRequest = getAPIMock()
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange })
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange })
      .put(`/api/v1/version/${versionToChange}`, updatedVersionObject)
      .basicAuth({ user: key })
      .reply(201, updatedVersionObject);

    await expect(
      run([
        '--key',
        key,
        versionToChange,
        '--newVersion',
        renamedVersion,
        '--deprecated',
        'true',
        '--beta',
        'true',
        '--main',
        'false',
        '--codename',
        'updated-test',
        '--hidden',
        'false',
      ]),
    ).resolves.toBe(`Version ${versionToChange} updated successfully.`);
    mockRequest.done();
  });

  it("should update a specific version object using flags that contain the string 'false'", async () => {
    const versionToChange = '1.1.0';
    const renamedVersion = '1.1.0-update';

    const updatedVersionObject = {
      codename: 'updated-test',
      version: renamedVersion,
      is_beta: false,
      is_deprecated: false,
      is_hidden: true,
      is_stable: false,
    };

    const mockRequest = getAPIMock()
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange })
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange })
      .put(`/api/v1/version/${versionToChange}`, updatedVersionObject)
      .basicAuth({ user: key })
      .reply(201, updatedVersionObject);

    await expect(
      run([
        '--key',
        key,
        versionToChange,
        '--newVersion',
        renamedVersion,
        '--beta',
        'false',
        '--deprecated',
        'false',
        '--main',
        'false',
        '--codename',
        'updated-test',
        '--hidden',
        'true',
      ]),
    ).resolves.toBe(`Version ${versionToChange} updated successfully.`);
    mockRequest.done();
  });

  it("should update a specific version object using flags that contain the string 'false' and a prompt", async () => {
    const versionToChange = '1.1.0';
    const renamedVersion = '1.1.0-update';
    // prompt for beta flag
    prompts.inject([false]);

    const updatedVersionObject = {
      codename: 'updated-test',
      version: renamedVersion,
      is_beta: false,
      is_hidden: false,
      is_stable: false,
    };

    const mockRequest = getAPIMock()
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange })
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange })
      .put(`/api/v1/version/${versionToChange}`, updatedVersionObject)
      .basicAuth({ user: key })
      .reply(201, updatedVersionObject);

    await expect(
      run([
        '--key',
        key,
        versionToChange,
        '--newVersion',
        renamedVersion,
        '--main',
        'false',
        '--codename',
        'updated-test',
        '--hidden',
        'false',
      ]),
    ).resolves.toBe(`Version ${versionToChange} updated successfully.`);
    mockRequest.done();
  });

  it('should update a specific version object even if user bypasses prompt for new version name', async () => {
    const versionToChange = '1.1.0';
    // simulating user entering nothing for the prompt to enter a new version name
    prompts.inject(['']);

    const updatedVersionObject = {
      codename: 'updated-test',
      is_beta: false,
      is_hidden: false,
      is_stable: false,
      version: versionToChange,
    };

    const mockRequest = getAPIMock()
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange })
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange })
      .put(`/api/v1/version/${versionToChange}`, updatedVersionObject)
      .basicAuth({ user: key })
      .reply(201, updatedVersionObject);

    await expect(
      run([
        '--key',
        key,
        versionToChange,
        '--beta',
        'false',
        '--main',
        'false',
        '--codename',
        'updated-test',
        '--hidden',
        'false',
      ]),
    ).resolves.toBe(`Version ${versionToChange} updated successfully.`);
    mockRequest.done();
  });

  it('should update a version to be the main one', async () => {
    const versionToChange = '1.1.0';
    const renamedVersion = '1.1.0-update';

    const updatedVersionObject = {
      version: renamedVersion,
      is_beta: false,
      is_stable: true,
    };

    const mockRequest = getAPIMock()
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange })
      .get(`/api/v1/version/${versionToChange}`)
      .basicAuth({ user: key })
      .reply(200, { version: versionToChange })
      .put(`/api/v1/version/${versionToChange}`, updatedVersionObject)
      .basicAuth({ user: key })
      .reply(201, updatedVersionObject);

    await expect(
      run([
        '--key',
        key,
        versionToChange,
        '--newVersion',
        renamedVersion,
        '--deprecated',
        'true',
        '--beta',
        'false',
        '--main',
        'true',
        '--hidden',
        'true',
      ]),
    ).resolves.toBe(`Version ${versionToChange} updated successfully.`);
    mockRequest.done();
  });

  it('should catch any put request errors', async () => {
    const renamedVersion = '1.0.0-update';

    const updatedVersionObject = {
      version: renamedVersion,
      is_beta: true,
      is_deprecated: true,
      is_hidden: false,
      is_stable: false,
    };

    prompts.inject([renamedVersion, false, true, false, true]);

    const errorResponse = {
      error: 'VERSION_DUPLICATE',
      message: 'The version already exists.',
      suggestion: '...a suggestion to resolve the issue...',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    const mockRequest = getAPIMock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version })
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version })
      .put(`/api/v1/version/${version}`, updatedVersionObject)
      .basicAuth({ user: key })
      .reply(400, errorResponse);

    await expect(run(['--key', key, version])).rejects.toStrictEqual(new APIError(errorResponse));
    mockRequest.done();
  });

  describe('bad flag values', () => {
    it('should throw if non-boolean `beta` flag is passed', () => {
      const versionToChange = '1.1.0';

      return expect(run(['--key', key, versionToChange, '--beta', 'hi'])).rejects.toThrow(
        'Expected --beta=hi to be one of: true, false',
      );
    });

    it('should throw if non-boolean `deprecated` flag is passed', () => {
      const versionToChange = '1.1.0';

      return expect(run(['--key', key, versionToChange, '--deprecated', 'hi'])).rejects.toThrow(
        'Expected --deprecated=hi to be one of: true, false',
      );
    });

    it('should throw if non-boolean `hidden` flag is passed', () => {
      const versionToChange = '1.1.0';

      return expect(run(['--key', key, versionToChange, '--hidden', 'hi'])).rejects.toThrow(
        'Expected --hidden=hi to be one of: true, false',
      );
    });

    it('should throw if non-boolean `main` flag is passed', () => {
      const versionToChange = '1.1.0';

      return expect(run(['--key', key, versionToChange, '--main', 'hi'])).rejects.toThrow(
        'Expected --main=hi to be one of: true, false',
      );
    });
  });
});
