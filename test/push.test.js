const nock = require('nock');

const utils = require('../utils');
const push = require('../lib/push');

const config = utils.config('test');
const apiKey = 'Xmw4bGctRVIQz7R7dQXqH9nQe5d0SPQs'

describe('push action', () => {
  after(() => nock.cleanAll());

  it('should POST to the swagger api if no id provided', (done) => {
    const mock = nock(config.host.url).post('/v1/api/swagger', (body) => {
      return true;
      return body.match('form-data; name=\"swagger\"');
    }).basicAuth({ user: apiKey, pass: '' }).reply(201);

    push.run(config, { args: ['./test/fixtures/json/swagger.json'], opts: { token: apiKey } }, (err) => {
      if (err) return done(err);
      mock.done();

      return done();
    });
  });
});