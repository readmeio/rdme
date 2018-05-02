const nock = require('nock');
const config = require('config');
const assert = require('assert');

const swagger = require('../cli').bind(null, 'swagger');

const key = 'Xmw4bGctRVIQz7R7dQXqH9nQe5d0SPQs';

describe('swagger command', () => {
  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', () =>
    swagger(['./test/fixtures/swagger.json'], {}).catch(err => {
      assert.equal(err.message, 'No api key provided. Please use --key');
    })
  );

  it('should error if no file provided', () =>
    swagger([], { key }).catch(err => {
      assert.equal(err.message, 'No swagger file provided. Usage `rdme swagger <swagger-file>`');
    })
  );

  it('should POST to the swagger api if no id provided', () => {
    const mock = nock(config.host)
      .post('/api/v1/swagger', body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    return swagger(['./test/fixtures/swagger.json'], { key })
      .then(() => mock.done());
  });

  it('should PUT to the swagger api if id is provided', () => {
    const id = '5aa0409b7cf527a93bfb44df';
    const mock = nock(config.host)
      .put(`/api/v1/swagger/${id}`, body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    return swagger(['./test/fixtures/swagger.json'], { key, id })
      .then(() => mock.done());
  });

  it('should still work with `token`', () => {
    const id = '5aa0409b7cf527a93bfb44df';
    const mock = nock(config.host)
      .put(`/api/v1/swagger/${id}`, body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    return swagger(['./test/fixtures/swagger.json'], { token: `${key}-${id}` })
      .then(() => mock.done());
  });
});
