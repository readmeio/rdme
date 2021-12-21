const nock = require('nock');
const chalk = require('chalk');
const config = require('config');
const fs = require('fs');
const promptHandler = require('../../src/lib/prompts');
const swagger = require('../../src/cmds/swagger');
const openapi = require('../../src/cmds/openapi');
const APIError = require('../../src/lib/apiError');

const key = 'API_KEY';
const id = '5aa0409b7cf527a93bfb44df';
const version = '1.0.0';
const exampleRefLocation = `${config.host}/project/example-project/1.0.1/refs/ex`;
const successfulMessageBase = [
  '',
  `\t${chalk.green(exampleRefLocation)}`,
  '',
  'To update your OpenAPI or Swagger definition, run the following:',
  '',
  `\t${chalk.green(`rdme openapi FILE --key=${key} --id=1`)}`,
];
const successfulUpload = [
  "You've successfully uploaded a new OpenAPI file to your ReadMe project!",
  ...successfulMessageBase,
].join('\n');

const successfulUpdate = [
  "You've successfully updated an OpenAPI file on your ReadMe project!",
  ...successfulMessageBase,
].join('\n');

jest.mock('../../src/lib/prompts');

const getCommandOutput = () => {
  return [console.warn.mock.calls.join('\n\n'), console.info.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
};

describe('rdme openapi', () => {
  beforeAll(() => nock.disableNetConnect());

  beforeEach(() => {
    console.info = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.info.mockRestore();
    console.warn.mockRestore();

    nock.cleanAll();
  });

  describe('upload', () => {
    it.each([
      ['Swagger 2.0', 'json', '2.0'],
      ['Swagger 2.0', 'yaml', '2.0'],
      ['OpenAPI 3.0', 'json', '3.0'],
      ['OpenAPI 3.0', 'yaml', '3.0'],
      ['OpenAPI 3.1', 'json', '3.1'],
      ['OpenAPI 3.1', 'yaml', '3.1'],
    ])('should support uploading a %s definition (format: %s)', async (_, format, specVersion) => {
      const mock = nock(config.host)
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      await expect(
        openapi.run({
          spec: require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`),
          key,
          version,
        })
      ).resolves.toBe(successfulUpload);

      expect(console.info).toHaveBeenCalledTimes(0);

      return mock.done();
    });

    it('should discover and upload an API definition if none is provided', async () => {
      promptHandler.createOasPrompt.mockResolvedValue({ option: 'create' });

      const mock = nock(config.host)
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [{ version }])
        .post('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, { from: '1.0.1', version: '1.0.1' })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      // Surface our test fixture to the root directory so rdme can autodiscover it. It's easier to do
      // this than mocking out the fs module because mocking the fs module here causes Jest sourcemaps
      // to break.
      fs.copyFileSync(require.resolve('@readme/oas-examples/2.0/json/petstore.json'), './swagger.json');

      await expect(openapi.run({ key })).resolves.toBe(successfulUpload);

      expect(console.info).toHaveBeenCalledTimes(1);

      const output = getCommandOutput();
      expect(output).toBe(chalk.yellow('We found swagger.json and are attempting to upload it.'));

      fs.unlinkSync('./swagger.json');
      return mock.done();
    });
  });

  describe('updates / resyncs', () => {
    it.each([
      ['Swagger 2.0', 'json', '2.0'],
      ['Swagger 2.0', 'yaml', '2.0'],
      ['OpenAPI 3.0', 'json', '3.0'],
      ['OpenAPI 3.0', 'yaml', '3.0'],
      ['OpenAPI 3.1', 'json', '3.1'],
      ['OpenAPI 3.1', 'yaml', '3.1'],
    ])('should support updating a %s definition (format: %s)', async (_, format, specVersion) => {
      const mock = nock(config.host)
        .put(`/api/v1/api-specification/${id}`, body => body.match('form-data; name="spec"'))
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      await expect(
        openapi.run({
          spec: require.resolve(`@readme/oas-examples/${specVersion}/${format}/petstore.${format}`),
          key,
          id,
          version,
        })
      ).resolves.toBe(successfulUpdate);

      return mock.done();
    });

    it('should still support `token`', async () => {
      const mock = nock(config.host)
        .put(`/api/v1/api-specification/${id}`, body => body.match('form-data; name="spec"'))
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      await expect(
        openapi.run({
          spec: require.resolve('@readme/oas-examples/3.1/json/petstore.json'),
          token: `${key}-${id}`,
          version,
        })
      ).resolves.toBe(successfulUpdate);

      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(console.info).toHaveBeenCalledTimes(0);

      const output = getCommandOutput();

      expect(output).toMatch(/The `--token` option has been deprecated/i);

      return mock.done();
    });

    it('should return warning if providing `id` and `version`', async () => {
      const mock = nock(config.host)
        .put(`/api/v1/api-specification/${id}`, body => body.match('form-data; name="spec"'))
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      await expect(
        openapi.run({ spec: require.resolve('@readme/oas-examples/3.1/json/petstore.json'), key, id, version })
      ).resolves.toBe(successfulUpdate);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledTimes(0);

      const output = getCommandOutput();

      expect(output).toMatch(/the `--version` option will be ignored/i);

      return mock.done();
    });
  });

  describe('versioning', () => {
    it.todo('should return a 404 if version flag not found');

    it('should request a version list if version is not found', async () => {
      promptHandler.generatePrompts.mockResolvedValue({
        option: 'create',
        newVersion: '1.0.1',
      });

      const mock = nock(config.host)
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [{ version: '1.0.0' }])
        .post('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, { from: '1.0.0', version: '1.0.1' })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      await expect(
        openapi.run({ spec: require.resolve('@readme/oas-examples/2.0/json/petstore.json'), key })
      ).resolves.toBe(successfulUpload);

      return mock.done();
    });
  });

  it('should bundle and upload the expected content', async () => {
    let requestBody = null;
    const mock = nock(config.host)
      .get('/api/v1/api-specification')
      .basicAuth({ user: key })
      .reply(200, [])
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version: '1.0.0' })
      .post('/api/v1/api-specification', body => {
        requestBody = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1);
        requestBody = JSON.parse(requestBody);

        return body.match('form-data; name="spec"');
      })
      .basicAuth({ user: key })
      .reply(201, { _id: 1 }, { location: exampleRefLocation });

    await expect(openapi.run({ spec: './__tests__/__fixtures__/ref-oas/petstore.json', key, version })).resolves.toBe(
      successfulUpload
    );

    expect(console.info).toHaveBeenCalledTimes(0);

    expect(requestBody).toMatchSnapshot();

    return mock.done();
  });

  describe('error handling', () => {
    it('should error if no api key provided', () => {
      return expect(
        openapi.run({ spec: require.resolve('@readme/oas-examples/3.0/json/petstore.json') })
      ).rejects.toThrow('No project API key provided. Please use `--key`.');
    });

    it('should error if no file was provided or able to be discovered', async () => {
      const mock = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' });

      await expect(openapi.run({ key, version })).rejects.toThrow(/We couldn't find an OpenAPI or Swagger definition./);

      return mock.done();
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

    it('should throw an error if an invalid Swagger definition is supplied', async () => {
      const errorObject = {
        error: 'INTERNAL_ERROR',
        message: 'Unknown error (README VALIDATION ERROR "x-samples-languages" must be of type "Array")',
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      };

      const mock = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(500, errorObject);

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

      const mock = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(400, errorObject);

      await expect(
        openapi.run({ spec: require.resolve('@readme/oas-examples/2.0/json/petstore.json'), key, version })
      ).rejects.toStrictEqual(new APIError(errorObject));

      return mock.done();
    });

    it('should error if API errors (generic upload error)', async () => {
      const mock = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(400, 'some non-JSON upload error');

      await expect(
        openapi.run({ spec: require.resolve('@readme/oas-examples/2.0/json/petstore.json'), key, version })
      ).rejects.toStrictEqual(new Error('There was an error uploading!'));

      return mock.done();
    });

    it('should error if API errors (request timeout)', async () => {
      const mock = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version: '1.0.0' })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, [])
        .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
        .delayConnection(1000)
        .basicAuth({ user: key })
        .reply(400, '<html></html>');

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
  it('should run `rdme openapi`', () => {
    return expect(swagger.run({ spec: '', key, id, version })).rejects.toThrow(
      "We couldn't find an OpenAPI or Swagger definition.\n\n" +
        'Run `rdme openapi ./path/to/api/definition` to upload an existing definition or `rdme oas init` to create a fresh one!'
    );
  });
});
