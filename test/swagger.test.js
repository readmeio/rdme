const nock = require('nock');

const utils = require('../utils');
const swagger = require('../lib/swagger');

const config = utils.config('test');
const apiKey = 'Xmw4bGctRVIQz7R7dQXqH9nQe5d0SPQs'

describe('swagger action', () => {
  after(() => nock.cleanAll());

  it('should POST to the swagger api if no id provided', (done) => {
    const mock = nock(config.host.url).post('/api/v1/swagger', (body) => {
      return body.match('form-data; name=\"swagger\"');
    }).basicAuth({ user: apiKey }).reply(201);

    swagger.run(config, { args: ['./test/fixtures/json/swagger.json'], opts: { token: apiKey } }, (err) => {
      if (err) return done(err);
      mock.done();

      return done();
    });
  });

  it('should PUT to the swagger api if id is provided', (done) => {
    const id = '5aa0409b7cf527a93bfb44df';
    const mock = nock(config.host.url).put(`/api/v1/swagger/${id}`, (body) => {
      return body.match('form-data; name=\"swagger\"');
    }).basicAuth({ user: apiKey }).reply(201);

    swagger.run(config, { args: ['./test/fixtures/json/swagger.json'], opts: { token: `${apiKey}-${id}` } }, (err) => {
      if (err) return done(err);
      mock.done();

      return done();
    });
  });
});