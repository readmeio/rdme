const nock = require('nock');
const config = require('config');
const fs = require('fs');
const promptHandler = require('../lib/prompts');

const swagger = require('../cli').bind(null, 'swagger');

const key = 'Xmw4bGctRVIQz7R7dQXqH9nQe5d0SPQs';
const version = '1.0.0';
jest.mock('../lib/prompts');

describe('swagger command', () => {
  beforeAll(() => nock.disableNetConnect());
  afterEach(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    expect(swagger(['./test/fixtures/swagger.json'], {})).rejects.toThrow(
      'No api key provided. Please use --key',
    );
  });

  it('should error if no file was provided or able to be discovered', () => {
    expect(swagger([], { key })).rejects.toThrow(
      "We couldn't find a Swagger or OpenAPI file.\n\n" +
        'Run `rdme swagger ./path/to/file` to upload an existing file or `rdme oas init` to create a fresh one!',
    );
  });

  it('should POST a discovered file if none provided', () => {
    const mock = nock(config.host)
      .get(`/api/v1/version`)
      .basicAuth({ user: key })
      .reply(200, [{ version }])
      .post('/api/v1/version')
      .basicAuth({ user: key })
      .reply(200, { from: '1.0.1', version: '1.0.1' })
      .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
      .delayConnection(1000)
      .basicAuth({ user: key })
      .reply(201, { body: '{ id: 1 }' });

    // Surface our test fixture to the root directory so rdme can autodiscover it. It's easier to do
    // this than mocking out the fs module because mocking the fs module here causes Jest sourcemaps
    // to break.
    fs.copyFileSync('./test/fixtures/swagger.json', './swagger.json');

    return swagger([], { key }).then(() => {
      fs.unlinkSync('./swagger.json');
      return mock.done();
    });
  });

  it('should error if API errors', async () => {
    const mock = nock(config.host)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version: '1.0.0' })
      .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
      .delayConnection(1000)
      .basicAuth({ user: key })
      .reply(400);

    return expect(swagger(['./test/fixtures/swagger.json'], { key, version }))
      .rejects.toThrow('There was an error uploading!')
      .then(() => mock.done());
  });

  it('should POST to the swagger api if no id provided', () => {
    const mock = nock(config.host)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version: '1.0.0' })
      .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
      .basicAuth({ user: key })
      .reply(201, { body: '{ id: 1 }' });

    return swagger(['./test/fixtures/swagger.json'], { key, version }).then(() => mock.done());
  });

  it('should return a 404 if version flag not found', () => {});

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
      .post('/api/v1/api-specification', body => body.match('form-data; name="spec"'))
      .basicAuth({ user: key })
      .reply(201, { id: 1 });

    return swagger(['./test/fixtures/swagger.json'], { key }).then(() => mock.done());
  });

  it('should PUT to the swagger api if id is provided', () => {
    const id = '5aa0409b7cf527a93bfb44df';

    const mock = nock(config.host)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version: '1.0.0' })
      .put(`/api/v1/api-specification/${id}`, body => body.match('form-data; name="spec"'))
      .basicAuth({ user: key })
      .reply(201, { body: '{ id: 1 }' });

    return swagger(['./test/fixtures/swagger.json'], { key, id, version }).then(() => mock.done());
  });

  it('should still work with `token`', () => {
    const id = '5aa0409b7cf527a93bfb44df';

    const mock = nock(config.host)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { body: `{ version: '1.0.0' }` })
      .put(`/api/v1/api-specification/${id}`, body => body.match('form-data; name="spec"'))
      .basicAuth({ user: key })
      .reply(201, { body: '{ id: 1 }' });

    return swagger(['./test/fixtures/swagger.json'], { token: `${key}-${id}`, version }).then(() =>
      mock.done(),
    );
  });
});
