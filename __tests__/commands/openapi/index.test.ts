/* eslint-disable no-console */

import fs from 'node:fs';

import chalk from 'chalk';
import nock from 'nock';
import prompts from 'prompts';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi, type MockInstance } from 'vitest';

import Command from '../../../src/commands/openapi/index.js';
import { APIv1Error } from '../../../src/lib/apiError.js';
import config from '../../../src/lib/config.js';
import petstoreWeird from '../../__fixtures__/petstore-simple-weird-version.json' with { type: 'json' };
import { getAPIv1Mock, getAPIv1MockWithVersionHeader } from '../../helpers/get-api-mock.js';
import { githubActionsEnv, gitMock } from '../../helpers/git-mock.js';
import { runCommandAndReturnResult } from '../../helpers/oclif.js';

let consoleInfoSpy: MockInstance;
let consoleWarnSpy: MockInstance;

const key = 'API_KEY';
const id = '5aa0409b7cf527a93bfb44df';
const version = '1.0.0';
const exampleRefLocation = `${config.host}/project/example-project/1.0.1/refs/ex`;
const successfulMessageBase = (specPath, specType) => [
  '',
  `\t${chalk.green(exampleRefLocation)}`,
  '',
  `To update your ${specType} definition, run the following:`,
  '',
  `\t${chalk.green(`rdme openapi ${specPath} --key=<key> --id=1`)}`,
];
const successfulUpload = (specPath, specType = 'OpenAPI') =>
  [
    `You've successfully uploaded a new ${specType} file to your ReadMe project!`,
    ...successfulMessageBase(specPath, specType),
  ].join('\n');

const successfulUpdate = (specPath, specType = 'OpenAPI') =>
  [
    `You've successfully updated an existing ${specType} file on your ReadMe project!`,
    ...successfulMessageBase(specPath, specType),
  ].join('\n');

const getCommandOutput = () => {
  return [consoleWarnSpy.mock.calls.join('\n\n'), consoleInfoSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
};

const getRandomRegistryId = () => Math.random().toString(36).substring(2);

describe('rdme openapi', () => {
  let run: (args?: string[]) => Promise<string>;
  let testWorkingDir: string;

  beforeAll(() => {
    nock.disableNetConnect();
    run = runCommandAndReturnResult(Command);
  });

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    testWorkingDir = process.cwd();
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();

    process.chdir(testWorkingDir);

    nock.cleanAll();
  });

  describe('upload', () => {
    it.each([
      ['Swagger 2.0', 'json', '2.0', 'Swagger'],
      ['Swagger 2.0', 'yaml', '2.0', 'Swagger'],
      ['OpenAPI 3.0', 'json', '3.0', 'OpenAPI'],
      ['OpenAPI 3.0', 'yaml', '3.0', 'OpenAPI'],
      ['OpenAPI 3.1', 'json', '3.1', 'OpenAPI'],
      ['OpenAPI 3.1', 'yaml', '3.1', 'OpenAPI'],

      // Postman collections get automatically converted to OpenAPI 3.0 by `oas-normalize`.
      ['Postman', 'json', '3.0', 'Postman'],
      ['Postman', 'yaml', '3.0', 'Postman'],
    ])('should support uploading a %s definition (format: %s)', async (_, format, specVersion, type) => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: specVersion } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' });

      const postMock = getAPIv1MockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      let spec;
      if (type === 'Postman') {
        spec = require.resolve(`../../__fixtures__/postman/petstore.collection.${format}`);
      } else {
        spec = require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`);
      }

      await expect(run(['--key', key, '--version', version, spec])).resolves.toBe(successfulUpload(spec, type));

      expect(console.info).toHaveBeenCalledTimes(0);

      postMock.done();
      return mock.done();
    });

    it('should create a new spec via prompts', async () => {
      prompts.inject(['create']);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [{ _id: 'spec1', title: 'spec1_title' }])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run(['--key', key, '--version', version, spec])).resolves.toBe(successfulUpload(spec));

      mockWithHeader.done();
      return mock.done();
    });

    it('should create a new spec via `--create` flag', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const postMock = getAPIv1MockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run(['--key', key, '--version', version, spec, '--create'])).resolves.toBe(successfulUpload(spec));

      postMock.done();
      return mock.done();
    });

    it('should create a new spec via `--create` flag and ignore `--id`', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [{ version }])
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const postMock = getAPIv1MockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run(['--key', key, '--id', 'some-id', spec, '--create'])).resolves.toBe(successfulUpload(spec));

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledTimes(0);

      const output = getCommandOutput();

      expect(output).toMatch(/the `--id` parameter will be ignored/i);

      postMock.done();
      return mock.done();
    });

    it('should bundle and upload the expected content', async () => {
      let requestBody;
      const registryUUID = getRandomRegistryId();
      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => {
          requestBody = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1);
          requestBody = JSON.parse(requestBody);

          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      const postMock = getAPIv1MockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run(['--key', key, '--version', version, spec])).resolves.toBe(successfulUpload(spec));

      expect(console.info).toHaveBeenCalledTimes(0);

      expect(requestBody).toMatchSnapshot();

      postMock.done();
      return mock.done();
    });

    it('should update title, bundle and upload the expected content', async () => {
      let requestBody;
      const registryUUID = getRandomRegistryId();
      const title = 'some alternative title';
      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => {
          requestBody = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1);
          requestBody = JSON.parse(requestBody);

          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      const postMock = getAPIv1MockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run(['--key', key, '--version', version, spec, '--title', title])).resolves.toBe(
        successfulUpload(spec),
      );

      expect(console.info).toHaveBeenCalledTimes(0);

      expect(requestBody).toMatchSnapshot();

      postMock.done();
      return mock.done();
    });

    it('should upload the expected content and return raw output', async () => {
      let requestBody;
      const registryUUID = getRandomRegistryId();
      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => {
          requestBody = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1);
          requestBody = JSON.parse(requestBody);

          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      const postMock = getAPIv1MockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run(['--key', key, '--version', version, spec, '--raw'])).resolves.toMatchSnapshot();

      postMock.done();
      return mock.done();
    });
  });

  describe('updates / resyncs', () => {
    it.each([
      ['Swagger 2.0', 'json', '2.0', 'Swagger'],
      ['Swagger 2.0', 'yaml', '2.0', 'Swagger'],
      ['OpenAPI 3.0', 'json', '3.0', 'OpenAPI'],
      ['OpenAPI 3.0', 'yaml', '3.0', 'OpenAPI'],
      ['OpenAPI 3.1', 'json', '3.1', 'OpenAPI'],
      ['OpenAPI 3.1', 'yaml', '3.1', 'OpenAPI'],
    ])('should support updating a %s definition (format: %s)', async (_, format, specVersion, type) => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: specVersion } });

      const putMock = getAPIv1MockWithVersionHeader(version)
        .put(`/api/v1/api-specification/${id}`, { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`);

      await expect(run(['--key', key, '--id', id, spec, '--version', version])).resolves.toBe(
        successfulUpdate(spec, type),
      );

      putMock.done();
      return mock.done();
    });

    it('should return warning if providing `id` and `version`', async () => {
      expect.assertions(4);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const putMock = getAPIv1MockWithVersionHeader(version)
        .put(`/api/v1/api-specification/${id}`, { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = require.resolve('@readme/oas-examples/3.1/json/petstore.json');

      await expect(run(['--key', key, '--id', id, spec, '--version', version])).resolves.toBe(successfulUpdate(spec));

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledTimes(0);

      const output = getCommandOutput();

      expect(output).toMatch(/the `--version` option will be ignored/i);

      putMock.done();
      return mock.done();
    });

    it('should update a spec via prompts', async () => {
      prompts.inject(['update', 'spec2']);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [
          { _id: 'spec1', title: 'spec1_title' },
          { _id: 'spec2', title: 'spec2_title' },
        ])
        .put('/api/v1/api-specification/spec2', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run(['--key', key, spec, '--version', version])).resolves.toBe(successfulUpdate(spec));

      mockWithHeader.done();
      return mock.done();
    });

    it('should discover and upload an API definition if none is provided', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => {
          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      const postMock = getAPIv1MockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = 'petstore.json';

      await expect(
        run(['--key', key, '--version', version, '--workingDirectory', './__tests__/__fixtures__/relative-ref-oas']),
      ).resolves.toBe(successfulUpload(spec));

      expect(console.info).toHaveBeenCalledTimes(1);

      const output = getCommandOutput();
      expect(output).toBe(chalk.yellow(`ℹ️  We found ${spec} and are attempting to upload it.`));

      postMock.done();
      return mock.done();
    });

    it('should use specified working directory and upload the expected content', async () => {
      let requestBody;
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => {
          requestBody = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1);
          requestBody = JSON.parse(requestBody);

          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      const postMock = getAPIv1MockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = 'petstore.json';

      await expect(
        run([
          spec,
          '--key',
          key,
          '--version',
          version,
          '--workingDirectory',
          './__tests__/__fixtures__/relative-ref-oas',
        ]),
      ).resolves.toBe(successfulUpload(spec));

      expect(console.info).toHaveBeenCalledTimes(0);

      expect(requestBody).toMatchSnapshot();

      postMock.done();
      return mock.done();
    });

    it('should return spec update info for dry run', async () => {
      prompts.inject(['update', 'spec2']);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [
          { _id: 'spec1', title: 'spec1_title' },
          { _id: 'spec2', title: 'spec2_title' },
        ]);

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run(['--key', key, spec, '--version', version, '--dryRun'])).resolves.toMatch(
        `dry run! The API Definition located at ${spec} will update this API Definition ID: spec2`,
      );

      mockWithHeader.done();
      return mock.done();
    });

    it('should return spec create info for dry run (with working directory)', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => {
          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      await expect(
        run([
          '--key',
          key,
          '--version',
          version,
          '--workingDirectory',
          './__tests__/__fixtures__/relative-ref-oas',
          '--dryRun',
        ]),
      ).resolves.toMatch(
        '🎭 dry run! The API Definition located at petstore.json will be created for this project version: 1.0.0',
      );

      const output = getCommandOutput();
      expect(output).toMatch(
        chalk.yellow('🎭 dry run option detected! No API definitions will be created or updated in ReadMe.'),
      );

      return mock.done();
    });

    describe('--update', () => {
      it("should update a spec file without prompts if providing `update` and it's the one spec available", async () => {
        const registryUUID = getRandomRegistryId();

        const mock = getAPIv1Mock()
          .get(`/api/v1/version/${version}`)
          .basicAuth({ user: key })
          .reply(200, { version })
          .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
          .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

        const mockWithHeader = getAPIv1MockWithVersionHeader(version)
          .get('/api/v1/api-specification')
          .basicAuth({ user: key })
          .reply(200, [{ _id: 'spec1', title: 'spec1_title' }])
          .put('/api/v1/api-specification/spec1', { registryUUID })
          .basicAuth({ user: key })
          .reply(201, { _id: 1 }, { location: exampleRefLocation });

        const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

        await expect(run(['--key', key, spec, '--version', version, '--update'])).resolves.toBe(successfulUpdate(spec));

        mockWithHeader.done();
        return mock.done();
      });

      it('should error if providing `update` and there are multiple specs available', async () => {
        const registryUUID = getRandomRegistryId();

        const mock = getAPIv1Mock()
          .get(`/api/v1/version/${version}`)
          .basicAuth({ user: key })
          .reply(200, { version })
          .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
          .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
          .get('/api/v1/api-specification')
          .basicAuth({ user: key })
          .reply(200, [
            { _id: 'spec1', title: 'spec1_title' },
            { _id: 'spec2', title: 'spec2_title' },
          ]);

        const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

        await expect(run(['--key', key, spec, '--version', version, '--update'])).rejects.toStrictEqual(
          new Error(
            "The `--update` option cannot be used when there's more than one API definition available (found 2).",
          ),
        );
        return mock.done();
      });

      it('should warn if providing both `update` and `id`', async () => {
        expect.assertions(5);
        const registryUUID = getRandomRegistryId();

        const mock = getAPIv1Mock()
          .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
          .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
          .put('/api/v1/api-specification/spec1', { registryUUID })
          .basicAuth({ user: key })
          .reply(function (uri, rBody, cb) {
            expect(this.req.headers['x-readme-version']).toBeUndefined();
            return cb(null, [201, { _id: 1 }, { location: exampleRefLocation }]);
          });

        const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

        await expect(run(['--key', key, spec, '--id', 'spec1', '--update'])).resolves.toBe(successfulUpdate(spec));

        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.info).toHaveBeenCalledTimes(0);

        const output = getCommandOutput();
        expect(output).toMatch(/the `--update` parameter will be ignored./);
        return mock.done();
      });
    });

    it.todo('should paginate to next and previous pages of specs');
  });

  describe('versioning', () => {
    it('should use version from version param properly', async () => {
      expect.assertions(2);
      let requestBody = '';
      const registryUUID = getRandomRegistryId();
      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => {
          requestBody = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1);
          requestBody = JSON.parse(requestBody);

          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(function (uri, rBody, cb) {
          expect(this.req.headers['x-readme-version']).toBe(version);
          return cb(null, [201, { _id: 1 }, { location: exampleRefLocation }]);
        });

      const spec = './__tests__/__fixtures__/petstore-simple-weird-version.json';

      await expect(run(['--key', key, '--version', version, spec])).resolves.toBe(successfulUpload(spec));

      mockWithHeader.done();
      return mock.done();
    });

    it('should use version from spec file properly', async () => {
      expect.assertions(2);
      const specVersion = '1.2.3';
      let requestBody = '';
      const registryUUID = getRandomRegistryId();
      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${specVersion}`)
        .basicAuth({ user: key })
        .reply(200, { version: specVersion })
        .post('/api/v1/api-registry', body => {
          requestBody = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1);
          requestBody = JSON.parse(requestBody);

          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(specVersion)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(function (uri, rBody, cb) {
          expect(this.req.headers['x-readme-version']).toBe(specVersion);
          return cb(null, [201, { _id: 1 }, { location: exampleRefLocation }]);
        });

      const spec = './__tests__/__fixtures__/petstore-simple-weird-version.json';

      await expect(run(['--key', key, spec, '--version', version, '--useSpecVersion'])).resolves.toBe(
        successfulUpload(spec),
      );

      mockWithHeader.done();
      return mock.done();
    });

    describe('CI version handling', () => {
      beforeEach(() => {
        process.env.TEST_RDME_CI = 'true';
      });

      afterEach(() => {
        delete process.env.TEST_RDME_CI;
      });

      it('should omit version header in CI environment', async () => {
        expect.assertions(2);
        let requestBody = '';
        const registryUUID = getRandomRegistryId();
        const mock = getAPIv1Mock()
          .post('/api/v1/api-registry', body => {
            requestBody = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1);
            requestBody = JSON.parse(requestBody);

            return body.match('form-data; name="spec"');
          })
          .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
          .get('/api/v1/api-specification')
          .basicAuth({ user: key })
          .reply(200, [])
          .post('/api/v1/api-specification', { registryUUID })
          .basicAuth({ user: key })
          .reply(function (uri, rBody, cb) {
            expect(this.req.headers['x-readme-version']).toBeUndefined();
            return cb(null, [201, { _id: 1 }, { location: exampleRefLocation }]);
          });

        const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

        await expect(run(['--key', key, spec])).resolves.toBe(successfulUpload(spec));

        return mock.done();
      });
    });

    it('should error if version flag sent to API returns a 404', async () => {
      const invalidVersion = 'v1000';

      const errorObject = {
        error: 'VERSION_NOTFOUND',
        message: `The version you specified (${invalidVersion}) doesn't match any of the existing versions (1.0) in ReadMe.`,
        suggestion:
          'You can pass the version in via the `x-readme-version` header. If you want to create a new version, do so in the Versions section inside ReadMe. Note that the version in the URL is our API version, not the version of your docs.',
        docs: 'https://docs.readme.com/logs/xx-xx-xx',
        help: "If you need help, email support@readme.io and include the following link to your API log: 'https://docs.readme.com/logs/xx-xx-xx'.",
        poem: [
          'We looked high and low,',
          'Searched up, down and around.',
          "You'll have to give it another go,",
          `Because version ${invalidVersion}'s not found!`,
        ],
      };

      const mock = getAPIv1Mock().get(`/api/v1/version/${invalidVersion}`).reply(404, errorObject);

      await expect(
        run([
          '--key',
          key,
          require.resolve('@readme/oas-examples/3.1/json/petstore.json'),
          '--version',
          invalidVersion,
        ]),
      ).rejects.toThrow(errorObject.message);

      return mock.done();
    });

    it('should request a version list if version is not found', async () => {
      const selectedVersion = '1.0.1';
      prompts.inject([selectedVersion]);

      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [{ version: '1.0.0' }, { version: '1.0.1' }])
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(selectedVersion)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = require.resolve('@readme/oas-examples/2.0/json/petstore.json');

      await expect(run(['--key', key, spec])).resolves.toBe(successfulUpload(spec, 'Swagger'));

      mockWithHeader.done();
      return mock.done();
    });
  });

  describe('error handling', () => {
    it('should error if `--create` and `--update` flags are passed simultaneously', () => {
      return expect(run(['--key', key, '--create', '--update'])).rejects.toThrow(
        '--update=true cannot also be provided when using --create',
      );
    });

    it('should error if invalid API key is sent and version list does not load', async () => {
      const errorObject = {
        error: 'APIKEY_NOTFOUND',
        message: "We couldn't find your API key.",
        suggestion:
          "The API key you passed in (API_KEY) doesn't match any keys we have in our system. API keys must be passed in as the username part of basic auth. You can get your API key in Configuration > API Key, or in the docs.",
        docs: 'https://docs.readme.com/logs/xx-xx-xx',
        help: "If you need help, email support@readme.io and include the following link to your API log: 'https://docs.readme.com/logs/xx-xx-xx'.",
        poem: [
          'The ancient gatekeeper declares:',
          "'To pass, reveal your API key.'",
          "'API_KEY', you start to ramble",
          'Oops, you remembered it poorly!',
        ],
      };

      const mock = getAPIv1Mock().get('/api/v1/version').reply(401, errorObject);

      await expect(
        run([require.resolve('@readme/oas-examples/3.1/json/petstore.json'), '--key', 'key']),
      ).rejects.toThrow(errorObject.message);

      return mock.done();
    });

    it('should throw an error if an invalid OpenAPI 3.0 definition is supplied', () => {
      return expect(
        run(['./__tests__/__fixtures__/invalid-oas.json', '--key', key, '--id', id, '--version', version]),
      ).rejects.toMatchSnapshot();
    });

    it('should throw an error if an invalid OpenAPI 3.1 definition is supplied', () => {
      return expect(
        run(['./__tests__/__fixtures__/invalid-oas-3.1.json', '--key', key, '--id', id, '--version', version]),
      ).rejects.toMatchSnapshot();
    });

    it('should throw an error if an invalid ref is supplied', () => {
      return expect(
        run(['./__tests__/__fixtures__/invalid-ref-oas/petstore.json', '--key', key, '--id', id, '--version', version]),
      ).rejects.toMatchSnapshot();
    });

    it('should throw an error if an invalid Swagger definition is supplied (create)', async () => {
      const errorObject = {
        error: 'INTERNAL_ERROR',
        message: 'Unknown error (README VALIDATION ERROR "x-samples-languages" must be of type "Array")',
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      };

      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(400, errorObject);

      await expect(
        run(['./__tests__/__fixtures__/swagger-with-invalid-extensions.json', '--key', key, '--version', version]),
      ).rejects.toStrictEqual(new APIv1Error(errorObject));

      mockWithHeader.done();
      return mock.done();
    });

    it('should throw an error if an invalid Swagger definition is supplied (update)', async () => {
      const errorObject = {
        error: 'INTERNAL_ERROR',
        message: 'Unknown error (README VALIDATION ERROR "x-samples-languages" must be of type "Array")',
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      };

      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const putMock = getAPIv1MockWithVersionHeader(version)
        .put(`/api/v1/api-specification/${id}`, { registryUUID })
        .basicAuth({ user: key })
        .reply(400, errorObject);

      await expect(
        run([
          './__tests__/__fixtures__/swagger-with-invalid-extensions.json',
          '--key',
          key,
          '--id',
          id,
          '--version',
          version,
        ]),
      ).rejects.toStrictEqual(new APIv1Error(errorObject));

      putMock.done();
      return mock.done();
    });

    it('should throw an error if registry upload fails', async () => {
      const errorObject = {
        error: 'INTERNAL_ERROR',
        message: 'Unknown error (Registry is offline? lol idk)',
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      };

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(400, errorObject);

      await expect(
        run(['./__tests__/__fixtures__/swagger-with-invalid-extensions.json', '--key', key, '--version', version]),
      ).rejects.toStrictEqual(new APIv1Error(errorObject));

      return mock.done();
    });

    it('should error if API errors', async () => {
      const errorObject = {
        error: 'SPEC_VERSION_NOTFOUND',
        message:
          "The version you specified ({version}) doesn't match any of the existing versions ({versions_list}) in ReadMe.",
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      };

      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(400, errorObject);

      await expect(
        run([require.resolve('@readme/oas-examples/2.0/json/petstore.json'), '--key', key, '--version', version]),
      ).rejects.toStrictEqual(new APIv1Error(errorObject));

      mockWithHeader.done();
      return mock.done();
    });

    it('should error if API errors (generic upload error)', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(400, 'some non-JSON upload error');

      await expect(
        run([require.resolve('@readme/oas-examples/2.0/json/petstore.json'), '--key', key, '--version', version]),
      ).rejects.toStrictEqual(
        new Error(
          'Yikes, something went wrong! Please try uploading your spec again and if the problem persists, get in touch with our support team at support@readme.io.',
        ),
      );

      mockWithHeader.done();
      return mock.done();
    });

    it('should error if API errors (request timeout)', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(500, '<title>Application Error</title>');

      await expect(
        run([require.resolve('@readme/oas-examples/2.0/json/petstore.json'), '--key', key, '--version', version]),
      ).rejects.toStrictEqual(
        new Error(
          "We're sorry, your upload request timed out. Please try again or split your file up into smaller chunks.",
        ),
      );

      mockWithHeader.done();
      return mock.done();
    });

    it('should error if no file was provided or able to be discovered', () => {
      return expect(run(['--key', key, '--version', version, '--workingDirectory', 'bin'])).rejects.toStrictEqual(
        new Error(
          "We couldn't find an OpenAPI or Swagger definition.\n\nPlease specify the path to your definition with `rdme openapi ./path/to/api/definition`.",
        ),
      );
    });
  });

  describe('GHA onboarding E2E tests', () => {
    let yamlOutput;

    beforeEach(() => {
      gitMock.before((fileName, data) => {
        yamlOutput = data;
      });
    });

    afterEach(() => {
      gitMock.after();
    });

    it('should create GHA workflow (create spec)', async () => {
      expect.assertions(6);
      const yamlFileName = 'openapi-file';
      prompts.inject(['create', true, 'openapi-branch', yamlFileName]);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [{ _id: 'spec1', title: 'spec1_title' }])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run([spec, '--key', key, '--version', version])).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${yamlFileName}.yml`, expect.any(String));
      expect(console.info).toHaveBeenCalledTimes(2);
      const output = getCommandOutput();
      expect(output).toMatch("Looks like you're running this command in a GitHub Repository!");
      expect(output).toMatch('successfully uploaded a new OpenAPI file to your ReadMe project');

      mockWithHeader.done();
      return mock.done();
    });

    it('should create GHA workflow (--github flag enabled)', async () => {
      expect.assertions(6);
      const yamlFileName = 'openapi-file-github-flag';
      prompts.inject(['create', 'openapi-branch-github-flag', yamlFileName]);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [{ _id: 'spec1', title: 'spec1_title' }])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run([spec, '--key', key, '--version', version, '--github'])).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${yamlFileName}.yml`, expect.any(String));
      expect(console.info).toHaveBeenCalledTimes(2);
      const output = getCommandOutput();
      expect(output).toMatch("Let's get you set up with GitHub Actions!");
      expect(output).toMatch('successfully uploaded a new OpenAPI file to your ReadMe project');

      mockWithHeader.done();
      return mock.done();
    });

    it('should create GHA workflow (update spec via prompt)', async () => {
      expect.assertions(3);
      const yamlFileName = 'openapi-file-update-prompt';
      prompts.inject(['update', 'spec2', true, 'openapi-branch-update-prompt', yamlFileName]);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [
          { _id: 'spec1', title: 'spec1_title' },
          { _id: 'spec2', title: 'spec2_title' },
        ])
        .put('/api/v1/api-specification/spec2', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 'spec2' }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run([spec, '--key', key, '--version', version])).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${yamlFileName}.yml`, expect.any(String));

      mockWithHeader.done();
      return mock.done();
    });

    it('should create GHA workflow (--create flag enabled)', async () => {
      expect.assertions(3);
      const yamlFileName = 'openapi-file-create-flag';
      const altVersion = '1.0.1';
      prompts.inject([true, 'openapi-branch-create-flag', yamlFileName]);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${altVersion}`)
        .basicAuth({ user: key })
        .reply(200, { version: altVersion })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(altVersion)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run([spec, '--key', key, '--version', altVersion, '--create'])).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${yamlFileName}.yml`, expect.any(String));

      mockWithHeader.done();
      return mock.done();
    });

    it('should create GHA workflow (--create flag enabled with ignored id opt)', async () => {
      expect.assertions(3);
      const yamlFileName = 'openapi-file-create-flag-id-opt';
      prompts.inject([version, true, 'openapi-branch-create-flag-id-opt', yamlFileName]);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [{ version }, { version: '1.1.0' }])
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const postMock = getAPIv1MockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run([spec, '--key', key, '--id', 'some-id', '--create'])).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${yamlFileName}.yml`, expect.any(String));

      postMock.done();
      return mock.done();
    });

    it('should create GHA workflow (--update flag enabled)', async () => {
      expect.assertions(3);
      const yamlFileName = 'openapi-file-update-flag';
      prompts.inject([true, 'openapi-branch-update-flag', yamlFileName]);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [{ _id: 'spec1', title: 'spec1_title' }])
        .put('/api/v1/api-specification/spec1', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run([spec, '--key', key, '--version', version, '--update'])).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${yamlFileName}.yml`, expect.any(String));

      mockWithHeader.done();
      return mock.done();
    });

    it('should create GHA workflow (including workingDirectory)', async () => {
      const yamlFileName = 'openapi-file-workingdirectory';
      prompts.inject([true, 'openapi-branch-workingdirectory', yamlFileName]);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => {
          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      const postMock = getAPIv1MockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = 'petstore.json';

      await expect(
        run([
          spec,
          '--key',
          key,
          '--version',
          version,
          '--workingDirectory',
          './__tests__/__fixtures__/relative-ref-oas',
        ]),
      ).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
      expect(fs.writeFileSync).toHaveBeenNthCalledWith(2, `.github/workflows/${yamlFileName}.yml`, expect.any(String));

      postMock.done();
      return mock.done();
    });

    it('should reject if user says no to creating GHA workflow', async () => {
      prompts.inject(['create', false]);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } });

      const mockWithHeader = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [{ _id: 'spec1', title: 'spec1_title' }])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run([spec, '--key', key, '--version', version])).rejects.toStrictEqual(
        new Error(
          'GitHub Actions workflow creation cancelled. If you ever change your mind, you can run this command again with the `--github` flag.',
        ),
      );

      mockWithHeader.done();
      return mock.done();
    });
  });

  describe('command execution in GitHub Actions runner', () => {
    beforeEach(() => {
      githubActionsEnv.before();
    });

    afterEach(() => {
      githubActionsEnv.after();
    });

    it('should error out if multiple possible spec matches were found', () => {
      return expect(run(['--key', key, '--version', version])).rejects.toStrictEqual(
        new Error('Multiple API definitions found in current directory. Please specify file.'),
      );
    });

    it('should send proper headers in GitHub Actions CI for local spec file', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIv1Mock()
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID });

      const putMock = getAPIv1Mock({
        'x-rdme-ci': 'GitHub Actions (test)',
        'x-readme-source': 'cli-gh',
        'x-readme-source-url':
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/ref-oas/petstore.json',
        'x-readme-version': version,
      })
        .put(`/api/v1/api-specification/${id}`, { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(run([spec, '--key', key, '--version', version, '--id', id])).resolves.toBe(successfulUpdate(spec));

      putMock.done();
      return mock.done();
    });

    it('should send proper headers in GitHub Actions CI for spec hosted at URL', async () => {
      const registryUUID = getRandomRegistryId();
      const spec = 'https://example.com/openapi.json';

      const mock = getAPIv1Mock()
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID });

      const exampleMock = nock('https://example.com').get('/openapi.json').reply(200, petstoreWeird);

      const putMock = getAPIv1Mock({
        'x-rdme-ci': 'GitHub Actions (test)',
        'x-readme-source': 'cli-gh',
        'x-readme-source-url': spec,
        'x-readme-version': version,
      })
        .put(`/api/v1/api-specification/${id}`, { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      await expect(run([spec, '--key', key, '--version', version, '--id', id])).resolves.toBe(successfulUpdate(spec));

      putMock.done();
      exampleMock.done();
      return mock.done();
    });

    it('should contain request header with correct URL with working directory', async () => {
      const registryUUID = getRandomRegistryId();
      const mock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => {
          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      const postMock = getAPIv1Mock({
        'x-rdme-ci': 'GitHub Actions (test)',
        'x-readme-source': 'cli-gh',
        'x-readme-source-url':
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/relative-ref-oas/petstore.json',
        'x-readme-version': version,
      })
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = 'petstore.json';

      await expect(
        run([
          spec,
          '--key',
          key,
          '--version',
          version,
          '--workingDirectory',
          './__tests__/__fixtures__/relative-ref-oas',
        ]),
      ).resolves.toBe(successfulUpload(spec));

      postMock.done();
      return mock.done();
    });
  });
});
