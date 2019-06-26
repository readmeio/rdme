const nock = require('nock');
const config = require('config');
const fs = require('fs');

const swagger = require('../cli').bind(null, 'swagger');

const key = 'Xmw4bGctRVIQz7R7dQXqH9nQe5d0SPQs';

describe('swagger command', () => {
  beforeAll(() => nock.disableNetConnect());
  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', () =>
    expect(swagger(['./test/fixtures/swagger.json'], {})).rejects.toThrow(
      'No api key provided. Please use --key',
    ));

  it('should error if no file was provided or able to be discovered', () => {
    expect(swagger([], { key })).rejects.toThrow(
      "We couldn't find a Swagger or OpenAPI file.\n\n" +
        'Run `rdme swagger ./path/to/file` to upload an existing file or `rdme oas init` to create a fresh one!',
    );
  });

  it('should POST a discovered file if none provided', () => {
    const mock = nock(config.host)
      .post('/api/v1/swagger', body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    // Surface our test fixture to the root directory so rdme can autodiscover it. It's easier to do
    // this than mocking out the fs module because mocking the fs module here causes Jest sourcemaps
    // to break.
    fs.copyFileSync('./test/fixtures/swagger.json', './swagger.json');

    return swagger([], { key }).then(() => {
      fs.unlinkSync('./swagger.json');
      mock.done();
    });
  });

  it('should error if API errors', async () => {
    const mock = nock(config.host)
      .post('/api/v1/swagger', body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(400);

    await expect(swagger(['./test/fixtures/swagger.json'], { key })).rejects.toThrow(
      'There was an error uploading!',
    );
    mock.done();
  });

  it('should POST to the swagger api if no id provided', () => {
    const mock = nock(config.host)
      .post('/api/v1/swagger', body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    return swagger(['./test/fixtures/swagger.json'], { key }).then(() => mock.done());
  });

  it('should PUT to the swagger api if id is provided', () => {
    const id = '5aa0409b7cf527a93bfb44df';
    const mock = nock(config.host)
      .put(`/api/v1/swagger/${id}`, body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    return swagger(['./test/fixtures/swagger.json'], { key, id }).then(() => mock.done());
  });

  it('should still work with `token`', () => {
    const id = '5aa0409b7cf527a93bfb44df';
    const mock = nock(config.host)
      .put(`/api/v1/swagger/${id}`, body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    return swagger(['./test/fixtures/swagger.json'], { token: `${key}-${id}` }).then(() =>
      mock.done(),
    );
  });
});
