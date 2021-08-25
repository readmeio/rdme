const nock = require('nock');
const config = require('config');
const fs = require('fs');
const promptHandler = require('../../src/lib/prompts');
const swagger = require('../../src/cmds/swagger');
const openapi = require('../../src/cmds/openapi');

const key = 'API_KEY';
const version = '1.0.0';

jest.mock('../../src/lib/prompts');

const getCommandOutput = () => {
  return [console.warn.mock.calls.join('\n\n'), console.log.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
};

describe('rdme openapi', () => {
  const exampleRefLocation = `${config.host}/project/example-project/1.0.1/refs/ex`;

  beforeAll(() => nock.disableNetConnect());

  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.log.mockRestore();
    console.warn.mockRestore();

    nock.cleanAll();
  });

  it('should POST a discovered file if none provided', () => {
    promptHandler.createOasPrompt.mockResolvedValue({ option: 'create' });

    const mock = nock(config.host)
      .get(`/api/v1/version`)
      .basicAuth({ user: key })
      .reply(200, [{ version }])
      .post('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, { from: '1.0.1', version: '1.0.1' })
      .get(`/api/v1/api-specification`)
      .basicAuth({ user: key })
      .reply(200, [])
      .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
      .delayConnection(1000)
      .basicAuth({ user: key })
      .reply(201, { _id: 1 }, { location: exampleRefLocation });

    // Surface our test fixture to the root directory so rdme can autodiscover it. It's easier to do
    // this than mocking out the fs module because mocking the fs module here causes Jest sourcemaps
    // to break.
    fs.copyFileSync('./__tests__/__fixtures__/swagger.json', './swagger.json');

    return openapi.run({ key }).then(() => {
      expect(console.log).toHaveBeenCalledTimes(2);

      const output = getCommandOutput();
      expect(output).toMatch(/we found swagger.json/i);
      expect(output).toMatch(/successfully uploaded/);
      expect(output).toMatch(exampleRefLocation);
      expect(output).toMatch(/to update your openapi or swagger file/i);

      fs.unlinkSync('./swagger.json');
      return mock.done();
    });
  });

  it('should error if API errors', () => {
    const mock = nock(config.host)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version: '1.0.0' })
      .get(`/api/v1/api-specification`)
      .basicAuth({ user: key })
      .reply(200, [])
      .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
      .delayConnection(1000)
      .basicAuth({ user: key })
      .reply(400, {
        error: 'SPEC_VERSION_NOTFOUND',
        message:
          "The version you specified ({version}) doesn't match any of the existing versions ({versions_list}) in ReadMe.",
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      });

    return openapi.run({ spec: './__tests__/__fixtures__/swagger.json', key, version }).then(() => {
      expect(console.log).toHaveBeenCalledTimes(1);

      const output = getCommandOutput();
      expect(output).toMatch(/The version you specified/);

      mock.done();
    });
  });

  it('should POST to the swagger api if no id provided', () => {
    const mock = nock(config.host)
      .get(`/api/v1/api-specification`)
      .basicAuth({ user: key })
      .reply(200, [])
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version: '1.0.0' })
      .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
      .basicAuth({ user: key })
      .reply(201, { _id: 1 }, { location: exampleRefLocation });

    return openapi.run({ spec: './__tests__/__fixtures__/swagger.json', key, version }).then(() => {
      expect(console.log).toHaveBeenCalledTimes(1);

      const output = getCommandOutput();
      expect(output).not.toMatch(/we found swagger.json/i);
      expect(output).toMatch(/successfully uploaded/);
      expect(output).toMatch(exampleRefLocation);
      expect(output).toMatch(/to update your openapi or swagger file/i);

      mock.done();
    });
  });

  it('should properly bubble up validation error if invalid swagger is uploaded', () => {
    const mock = nock(config.host)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version: '1.0.0' })
      .get(`/api/v1/api-specification`)
      .basicAuth({ user: key })
      .reply(200, [])
      .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
      .delayConnection(1000)
      .basicAuth({ user: key })
      .reply(500, {
        error: 'INTERNAL_ERROR',
        message: 'Unknown error (README VALIDATION ERROR "x-samples-languages" must be of type "Array")',
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      });

    return openapi.run({ spec: './__tests__/__fixtures__/invalid-swagger.json', key, version }).then(() => {
      expect(console.log).toHaveBeenCalledTimes(1);

      const output = getCommandOutput();
      expect(output).toMatch(/Unknown error \(README VALIDATION ERROR "x-samples-languages" /);

      mock.done();
    });
  });

  it.todo('should return a 404 if version flag not found');

  it('should request a version list if version is not found', () => {
    promptHandler.generatePrompts.mockResolvedValue({
      option: 'create',
      newVersion: '1.0.1',
    });

    const mock = nock(config.host)
      .get('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, [{ version: '1.0.1' }])
      .post('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, { from: '1.0.1', version: '1.0.1' })
      .get(`/api/v1/api-specification`)
      .basicAuth({ user: key })
      .reply(200, [])
      .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
      .basicAuth({ user: key })
      .reply(201, { _id: 1 }, { location: exampleRefLocation });

    return openapi.run({ spec: './__tests__/__fixtures__/swagger.json', key }).then(() => {
      mock.done();
    });
  });

  it('should PUT to the swagger api if id is provided', () => {
    const id = '5aa0409b7cf527a93bfb44df';

    const mock = nock(config.host)
      .put(`/api/v1/api-specification/${id}`, body => body.match('form-data; name="spec"'))
      .basicAuth({ user: key })
      .reply(201, { body: '{ id: 1 }' });

    return openapi.run({ spec: './__tests__/__fixtures__/swagger.json', key, id, version }).then(() => {
      mock.done();
    });
  });

  it('should still work with `token`', () => {
    const id = '5aa0409b7cf527a93bfb44df';

    const mock = nock(config.host)
      .put(`/api/v1/api-specification/${id}`, body => body.match('form-data; name="spec"'))
      .basicAuth({ user: key })
      .reply(201, { id: 1 }, { location: exampleRefLocation });

    return openapi.run({ spec: './__tests__/__fixtures__/swagger.json', token: `${key}-${id}`, version }).then(() => {
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledTimes(1);

      const output = getCommandOutput();

      expect(output).toMatch(/using `rdme` with --token/i);

      mock.done();
    });
  });

  it('should bundle and upload the expected content', () => {
    let requestBody = null;
    const mock = nock(config.host)
      .get(`/api/v1/api-specification`)
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

    return openapi.run({ spec: './__tests__/__fixtures__/ref-oas/petstore.json', key, version }).then(() => {
      expect(console.log).toHaveBeenCalledTimes(1);

      expect(requestBody).toMatchSnapshot();

      const output = getCommandOutput();
      expect(output).toMatch(/successfully uploaded/);
      expect(output).toMatch(exampleRefLocation);
      expect(output).toMatch(/to update your openapi or swagger file/i);

      mock.done();
    });
  });

  it('should error if no api key provided', async () => {
    await expect(openapi.run({ spec: './__tests__/__fixtures__/swagger.json' })).rejects.toThrow(
      'No project API key provided. Please use `--key`.'
    );
  });

  it('should error if no file was provided or able to be discovered', async () => {
    const mock = nock(config.host)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version: '1.0.0' });

    await expect(openapi.run({ key, version })).rejects.toThrow(/We couldn't find an OpenAPI or Swagger file./);

    mock.done();
  });

  it('should throw an error if file is invalid', async () => {
    const id = '5aa0409b7cf527a93bfb44df';

    await expect(openapi.run({ spec: './__tests__/__fixtures__/invalid-oas.json', key, id, version })).rejects.toThrow(
      'Token "Error" does not exist.'
    );
  });
});

describe('rdme swagger', () => {
  it('should run `rdme openapi`', async () => {
    const id = '5aa0409b7cf527a93bfb44df';

    await expect(swagger.run({ spec: '', key, id, version })).rejects.toThrow(
      "We couldn't find an OpenAPI or Swagger file.\n\n" +
        'Run `rdme openapi ./path/to/file` to upload an existing file or `rdme oas init` to create a fresh one!'
    );
  });
});
