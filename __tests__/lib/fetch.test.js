const config = require('config');
const fetch = require('../../src/lib/fetch');
const { cleanHeaders, handleRes } = require('../../src/lib/fetch');
const getApiNock = require('../get-api-nock');
const pkg = require('../../package.json');

describe('#fetch()', () => {
  it('should wrap all requests with a rdme User-Agent', async () => {
    const key = 'API_KEY';

    const mock = getApiNock()
      .get('/api/v1')
      .basicAuth({ user: key })
      .reply(200, function () {
        return this.req.headers['user-agent'];
      });

    const userAgent = await fetch(`${config.get('host')}/api/v1`, {
      method: 'get',
      headers: cleanHeaders(key),
    }).then(handleRes);

    expect(userAgent.shift()).toBe(`rdme/${pkg.version}`);
    mock.done();
  });

  it('should support if we dont supply any other options with the request', async () => {
    const mock = getApiNock()
      .get('/api/v1/doesnt-need-auth')
      .reply(200, function () {
        return this.req.headers['user-agent'];
      });

    const userAgent = await fetch(`${config.get('host')}/api/v1/doesnt-need-auth`).then(handleRes);

    expect(userAgent.shift()).toBe(`rdme/${pkg.version}`);
    mock.done();
  });
});

describe('#cleanHeaders()', () => {
  it('should base64-encode key in ReadMe-friendly format', () => {
    expect(cleanHeaders('test')).toStrictEqual({ Authorization: 'Basic dGVzdDo=' });
  });

  it('should filter out undefined headers', () => {
    expect(cleanHeaders('test', { 'x-readme-version': undefined })).toStrictEqual({ Authorization: 'Basic dGVzdDo=' });
  });

  it('should filter out null headers', () => {
    expect(cleanHeaders('test', { 'x-readme-version': undefined, Accept: null })).toStrictEqual({
      Authorization: 'Basic dGVzdDo=',
    });
  });

  it('should pass in properly defined headers', () => {
    expect(
      cleanHeaders('test', { 'x-readme-version': undefined, Accept: null, 'Content-Type': 'application/json' })
    ).toStrictEqual({
      Authorization: 'Basic dGVzdDo=',
      'Content-Type': 'application/json',
    });
  });
});
