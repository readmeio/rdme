const nock = require('nock');
const config = require('config');
const assert = require('assert');

const swagger = require('../lib/swagger');

const key = 'Xmw4bGctRVIQz7R7dQXqH9nQe5d0SPQs';

describe('swagger command', () => {
  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', (done) => {
    swagger.run({
      args: ['./test/fixtures/swagger.json'],
      opts: {},
    }, (err) => {
      assert.equal(err.message, 'No api key provided. Please use --key');
      return done();
    });
  });

  it('should error if no file provided', (done) => {
    swagger.run({
      args: [],
      opts: { key },
    }, (err) => {
      assert.equal(err.message, 'No swagger file provided. Usage `rdme swagger <swagger-file>`');
      return done();
    })
  });

  it('should POST to the swagger api if no id provided', done => {
    const mock = nock(config.host)
      .post('/api/v1/swagger', body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    swagger.run(
      { args: ['./test/fixtures/swagger.json'], opts: { key } },
      err => {
        if (err) return done(err);
        mock.done();

        return done();
      },
    );
  });

  it('should PUT to the swagger api if id is provided', done => {
    const id = '5aa0409b7cf527a93bfb44df';
    const mock = nock(config.host)
      .put(`/api/v1/swagger/${id}`, body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    swagger.run(
      {
        args: ['./test/fixtures/swagger.json'],
        opts: { key, id },
      },
      err => {
        if (err) return done(err);
        mock.done();

        return done();
      },
    );
  });

  it('should still work with `token`', done => {
    const id = '5aa0409b7cf527a93bfb44df';
    const mock = nock(config.host)
      .put(`/api/v1/swagger/${id}`, body => body.match('form-data; name="swagger"'))
      .basicAuth({ user: key })
      .reply(201);

    swagger.run(
      {
        args: ['./test/fixtures/swagger.json'],
        opts: { token: `${key}-${id}` },
      },
      err => {
        if (err) return done(err);
        mock.done();

        return done();
      },
    );
  });
});
