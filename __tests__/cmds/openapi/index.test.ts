/* eslint-disable no-console */
import chalk from 'chalk';
import config from 'config';
import nock from 'nock';
import prompts from 'prompts';

import OpenAPICommand from '../../../src/cmds/openapi';
import SwaggerCommand from '../../../src/cmds/swagger';
import APIError from '../../../src/lib/apiError';
import getAPIMock from '../../helpers/get-api-mock';

const openapi = new OpenAPICommand();
const swagger = new SwaggerCommand();

let consoleInfoSpy;
let consoleWarnSpy;

const key = 'API_KEY';
const id = '5aa0409b7cf527a93bfb44df';
const version = '1.0.0';
const exampleRefLocation = `${config.get('host')}/project/example-project/1.0.1/refs/ex`;
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

const testWorkingDir = process.cwd();

const getCommandOutput = () => {
  return [consoleWarnSpy.mock.calls.join('\n\n'), consoleInfoSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
};

const getRandomRegistryId = () => Math.random().toString(36).substring(2);

describe('rdme openapi', () => {
  beforeAll(() => nock.disableNetConnect());

  beforeEach(() => {
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();

    nock.cleanAll();

    process.chdir(testWorkingDir);
  });

  describe('upload', () => {
    it.each([
      ['Swagger 2.0', 'json', '2.0', 'Swagger'],
      ['Swagger 2.0', 'yaml', '2.0', 'Swagger'],
      ['OpenAPI 3.0', 'json', '3.0', 'OpenAPI'],
      ['OpenAPI 3.0', 'yaml', '3.0', 'OpenAPI'],
      ['OpenAPI 3.1', 'json', '3.1', 'OpenAPI'],
      ['OpenAPI 3.1', 'yaml', '3.1', 'OpenAPI'],
    ])('should support uploading a %s definition (format: %s)', async (_, format, specVersion, type) => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIMock()
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: specVersion } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`);

      await expect(
        openapi.run({
          spec,
          key,
          version,
        })
      ).resolves.toBe(successfulUpload(spec, type));

      expect(console.info).toHaveBeenCalledTimes(0);

      return mock.done();
    });

    it('should discover and upload an API definition if none is provided', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, [{ version }])
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = 'petstore.json';

      await expect(
        openapi.run({
          key,
          version,
          workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
        })
      ).resolves.toBe(successfulUpload(spec));

      expect(console.info).toHaveBeenCalledTimes(1);

      const output = getCommandOutput();
      expect(output).toBe(chalk.yellow(`ℹ️  We found ${spec} and are attempting to upload it.`));

      return mock.done();
    });

    it('should create a new spec via prompts', async () => {
      prompts.inject(['create']);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, [{ version }])
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [{ _id: 'spec1', title: 'spec1_title' }])
        .post('/api/v1/api-specification', { registryUUID })
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(
        openapi.run({
          key,
          version,
          spec,
        })
      ).resolves.toBe(successfulUpload(spec));

      return mock.done();
    });

    it('should bundle and upload the expected content', async () => {
      let requestBody;
      const registryUUID = getRandomRegistryId();
      const mock = getAPIMock()
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
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(openapi.run({ spec, key, version })).resolves.toBe(successfulUpload(spec));

      expect(console.info).toHaveBeenCalledTimes(0);

      expect(requestBody).toMatchSnapshot();

      return mock.done();
    });

    it('should use specified working directory and upload the expected content', async () => {
      let requestBody;
      const registryUUID = getRandomRegistryId();
      const mock = getAPIMock()
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
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = 'petstore.json';

      await expect(
        openapi.run({
          spec,
          key,
          version,
          workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
        })
      ).resolves.toBe(successfulUpload(spec));

      expect(console.info).toHaveBeenCalledTimes(0);

      expect(requestBody).toMatchSnapshot();

      return mock.done();
    });

    describe('CI spec selection', () => {
      beforeEach(() => {
        process.env.TEST_CI = 'true';
      });

      afterEach(() => {
        delete process.env.TEST_CI;
      });

      it('should error out if multiple possible spec matches were found', () => {
        return expect(
          openapi.run({
            key,
            version,
          })
        ).rejects.toStrictEqual(new Error('Multiple API definitions found in current directory. Please specify file.'));
      });
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

      const mock = getAPIMock()
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: specVersion } })
        .put(`/api/v1/api-specification/${id}`, { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`);

      await expect(
        openapi.run({
          spec,
          key,
          id,
          version,
        })
      ).resolves.toBe(successfulUpdate(spec, type));

      return mock.done();
    });

    it('should return warning if providing `id` and `version`', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIMock()
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .put(`/api/v1/api-specification/${id}`, { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = require.resolve('@readme/oas-examples/3.1/json/petstore.json');

      await expect(openapi.run({ spec, key, id, version })).resolves.toBe(successfulUpdate(spec));

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledTimes(0);

      const output = getCommandOutput();

      expect(output).toMatch(/the `--version` option will be ignored/i);

      return mock.done();
    });

    it('should update a spec via prompts', async () => {
      prompts.inject(['update', 'spec2']);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, [{ version }])
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [
          { _id: 'spec1', title: 'spec1_title' },
          { _id: 'spec2', title: 'spec2_title' },
        ])
        .put('/api/v1/api-specification/spec2', { registryUUID })
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = './__tests__/__fixtures__/ref-oas/petstore.json';

      await expect(
        openapi.run({
          key,
          version,
          spec,
        })
      ).resolves.toBe(successfulUpdate(spec));
      return mock.done();
    });

    it.todo('should paginate to next and previous pages of specs');
  });

  describe('versioning', () => {
    it('should use version from version param properly', async () => {
      expect.assertions(2);
      let requestBody = '';
      const registryUUID = getRandomRegistryId();
      const mock = getAPIMock()
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
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(function (uri, rBody, cb) {
          expect(this.req.headers['x-readme-version'][0]).toBe(version);
          return cb(null, [201, { _id: 1 }, { location: exampleRefLocation }]);
        });

      const spec = './__tests__/__fixtures__/petstore-simple-weird-version.json';

      await expect(openapi.run({ spec, key, version })).resolves.toBe(successfulUpload(spec));

      return mock.done();
    });

    it('should use version from spec file properly', async () => {
      expect.assertions(2);
      const specVersion = '1.2.3';
      let requestBody = '';
      const registryUUID = getRandomRegistryId();
      const mock = getAPIMock()
        .get(`/api/v1/version/${specVersion}`)
        .basicAuth({ user: key })
        .reply(200, { version: specVersion })
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
          expect(this.req.headers['x-readme-version'][0]).toBe(specVersion);
          return cb(null, [201, { _id: 1 }, { location: exampleRefLocation }]);
        });

      const spec = './__tests__/__fixtures__/petstore-simple-weird-version.json';

      await expect(openapi.run({ spec, key, version, useSpecVersion: true })).resolves.toBe(successfulUpload(spec));

      return mock.done();
    });

    describe('CI version handling', () => {
      beforeEach(() => {
        process.env.TEST_CI = 'true';
      });

      afterEach(() => {
        delete process.env.TEST_CI;
      });

      it('should omit version header in CI environment', async () => {
        expect.assertions(2);
        let requestBody = '';
        const registryUUID = getRandomRegistryId();
        const mock = getAPIMock()
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

        await expect(openapi.run({ spec, key })).resolves.toBe(successfulUpload(spec));

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

      const mock = getAPIMock().get(`/api/v1/version/${invalidVersion}`).reply(404, errorObject);

      await expect(
        openapi.run({
          spec: require.resolve('@readme/oas-examples/3.1/json/petstore.json'),
          key,
          version: invalidVersion,
        })
      ).rejects.toStrictEqual(new APIError(errorObject));

      return mock.done();
    });

    it('should request a version list if version is not found', async () => {
      prompts.inject(['create', '1.0.1']);

      const registryUUID = getRandomRegistryId();

      const mock = getAPIMock()
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [{ version: '1.0.0' }])
        .post('/api/v1/version', { from: '1.0.0', version: '1.0.1', is_stable: false })
        .basicAuth({ user: key })
        .reply(200, { from: '1.0.0', version: '1.0.1' })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = require.resolve('@readme/oas-examples/2.0/json/petstore.json');

      await expect(openapi.run({ spec, key })).resolves.toBe(successfulUpload(spec, 'Swagger'));

      return mock.done();
    });
  });

  describe('error handling', () => {
    it('should error if no api key provided', () => {
      return expect(
        openapi.run({ spec: require.resolve('@readme/oas-examples/3.0/json/petstore.json') })
      ).rejects.toStrictEqual(new Error('No project API key provided. Please use `--key`.'));
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

      const mock = getAPIMock().get('/api/v1/version').reply(401, errorObject);

      await expect(
        openapi.run({ key, spec: require.resolve('@readme/oas-examples/3.1/json/petstore.json') })
      ).rejects.toStrictEqual(new APIError(errorObject));

      return mock.done();
    });

    it('should error if no file was provided or able to be discovered', () => {
      return expect(openapi.run({ key, version, workingDirectory: 'config' })).rejects.toThrow(
        /We couldn't find an OpenAPI or Swagger definition./
      );
    });

    it('should throw an error if an invalid OpenAPI 3.0 definition is supplied', () => {
      return expect(
        openapi.run({ spec: './__tests__/__fixtures__/invalid-oas.json', key, id, version })
      ).rejects.toThrow('Token "Error" does not exist.');
    });

    it('should throw an error if an invalid OpenAPI 3.1 definition is supplied', () => {
      return expect(
        openapi.run({ spec: './__tests__/__fixtures__/invalid-oas-3.1.json', key, id, version })
      ).rejects.toMatchSnapshot();
    });

    it('should throw an error if an invalid ref is supplied', () => {
      return expect(
        openapi.run({ spec: './__tests__/__fixtures__/invalid-ref-oas/petstore.json', key, id, version })
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

      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(400, errorObject);

      await expect(
        openapi.run({
          spec: './__tests__/__fixtures__/swagger-with-invalid-extensions.json',
          key,
          version,
        })
      ).rejects.toStrictEqual(new APIError(errorObject));

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

      const mock = getAPIMock()
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .put(`/api/v1/api-specification/${id}`, { registryUUID })
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(400, errorObject);

      await expect(
        openapi.run({
          spec: './__tests__/__fixtures__/swagger-with-invalid-extensions.json',
          id,
          key,
          version,
        })
      ).rejects.toStrictEqual(new APIError(errorObject));

      return mock.done();
    });

    it('should throw an error if registry upload fails', async () => {
      const errorObject = {
        error: 'INTERNAL_ERROR',
        message: 'Unknown error (Registry is offline? lol idk)',
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      };

      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(400, errorObject);

      await expect(
        openapi.run({
          spec: './__tests__/__fixtures__/swagger-with-invalid-extensions.json',
          key,
          version,
        })
      ).rejects.toStrictEqual(new APIError(errorObject));

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

      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(400, errorObject);

      await expect(
        openapi.run({ spec: require.resolve('@readme/oas-examples/2.0/json/petstore.json'), key, version })
      ).rejects.toStrictEqual(new APIError(errorObject));

      return mock.done();
    });

    it('should error if API errors (generic upload error)', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(400, 'some non-JSON upload error');

      await expect(
        openapi.run({ spec: require.resolve('@readme/oas-examples/2.0/json/petstore.json'), key, version })
      ).rejects.toStrictEqual(
        new Error(
          'Yikes, something went wrong! Please try uploading your spec again and if the problem persists, get in touch with our support team at support@readme.io.'
        )
      );

      return mock.done();
    });

    it('should error if API errors (request timeout)', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-registry', body => body.match('form-data; name="spec"'))
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', { registryUUID })
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(500, '<title>Application Error</title>');

      await expect(
        openapi.run({ spec: require.resolve('@readme/oas-examples/2.0/json/petstore.json'), key, version })
      ).rejects.toStrictEqual(
        new Error(
          "We're sorry, your upload request timed out. Please try again or split your file up into smaller chunks."
        )
      );

      return mock.done();
    });
  });
});

describe('rdme swagger', () => {
  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should run `rdme openapi`', () => {
    return expect(swagger.run({ spec: 'some-non-existent-path', key, id, version })).rejects.toThrow(
      "ENOENT: no such file or directory, open 'some-non-existent-path'"
    );
  });
});
