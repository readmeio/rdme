const nock = require('nock');
const config = require('config');

const swagger = require('../cli').bind(null, 'swagger');

const key = 'Xmw4bGctRVIQz7R7dQXqH9nQe5d0SPQs';

describe('swagger command', () => {
  beforeAll(() => nock.disableNetConnect());
  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', () =>
    expect(swagger(['./test/fixtures/swagger.json'], {})).rejects.toThrow(
      'No api key provided. Please use --key',
    ));

  it('should error if no file provided', () =>
    expect(swagger([], { key })).rejects.toThrow(
      'No swagger file provided. Usage `rdme swagger <swagger-file>`',
    ));

  it('should error if API errors', async () => {
    const mock = nock(config.host)
      .post('/api/v1/api-specification', body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(400);

    await expect(swagger(['./test/fixtures/swagger.json'], { key })).rejects.toThrow(
      'There was an error uploading!',
    );
    mock.done();
  });

  it('should POST to the swagger api if no id provided', () => {
    const mock = nock(config.host)
      .post('/api/v1/api-specification', body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    return swagger(['./test/fixtures/swagger.json'], { key }).then(() => mock.done());
  });

  it('should PUT to the swagger api if id is provided', () => {
    const id = '5aa0409b7cf527a93bfb44df';
    const mock = nock(config.host)
      .put(`/api/v1/api-specification/${id}`, body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    return swagger(['./test/fixtures/swagger.json'], { key, id }).then(() => mock.done());
  });

  it('should still work with `token`', () => {
    const id = '5aa0409b7cf527a93bfb44df';
    const mock = nock(config.host)
      .put(`/api/v1/api-specification/${id}`, body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    return swagger(['./test/fixtures/swagger.json'], { token: `${key}-${id}` }).then(() =>
      mock.done(),
    );
  });
});
