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
      .post('/api/v1/swagger', body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(400);

    await expect(swagger(['./test/fixtures/swagger.json'], { key })).rejects.toThrow(
      'There was an error uploading!',
    );
    mock.done();
  });

  // POST | PUT - I want to upload this file
  // POLLING - I want to check on the updates for this file
  // LOGS - My upload failed? What happened?

  const id = '5aa0409b7cf527a93bfb44df';
  const put = function(success = true) {
    return nock(config.host)
      .put(`/api/v1/swagger/${id}`, body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(success ? 201 : 404);
  };

  const post = function(success = true) {
    return nock(config.host)
      .post('/api/v1/swagger', body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(success ? 201 : 404, { _id: id });
  };

  const poll = function(success = true) {
    return nock(config.host)
      .get(`/api/v1/api-specification/${id}`)
      .basicAuth({ user: key })
      .reply(success ? 201 : 404, success ? { status: 100 } : null);
  };

  const logs = function(success = true) {
    return nock(config.host)
      .get(`/api/v1/api-specification/logs/${id}`)
      .basicAuth({ user: key })
      .reply(success ? 201 : 404, success ? ['A log message'] : null);
  };

  it('success POST success POLL success', () => {
    let mock = nock(config.host);
    mock = post();
    mock = poll();

    return swagger(['./test/fixtures/swagger.json'], { key }).then(() => mock.done());
  });

  it('success PUT success POLL success', () => {
    let mock = nock(config.host);
    mock = put();
    mock = poll();

    return swagger(['./test/fixtures/swagger.json'], { key, id }).then(() => mock.done());
  });

  it('success POST success POLL fail LOGS success', () => {
    post();
    poll(false);
    logs();

    return swagger(['./test/fixtures/swagger.json'], { key })
      .then(() => {
        throw new Error('it should not go here');
      })
      .catch(e => {
        expect(e.message).toBe('There was an error uploading: ["A log message"]');
      });
  });

  it('success POST success POLL fail LOGS fail', () => {
    post();
    poll(false);
    logs(false);

    return swagger(['./test/fixtures/swagger.json'], { key })
      .then(() => {
        throw new Error('it should not go here');
      })
      .catch(e => {
        expect(e.statusCode === 404);
      });
  });

  it('success PUT success POLL fail LOGS success', () => {
    put();
    poll(false);
    logs();

    return swagger(['./test/fixtures/swagger.json'], { key, id })
      .then(() => {
        throw new Error('it should not go here');
      })
      .catch(e => {
        expect(e.message).toBe('There was an error uploading: ["A log message"]');
      });
  });

  it('should still work with `token`', () => {
    put();
    const mock = poll();

    return swagger(['./test/fixtures/swagger.json'], { token: `${key}-${id}` }).then(() =>
      mock.done(),
    );
  });
});
