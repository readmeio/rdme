const nock = require('nock');
const config = require('config');
const assert = require('assert');

const configStore = require('../../lib/configstore');
const login = require('../../cmds/login').handler;

describe('login command', () => {
  beforeAll(() => nock.disableNetConnect());
  afterAll(() => nock.cleanAll());
  afterEach(() => configStore.clear());

  it('should error if no project provided', done =>
    login({}).catch(err => {
      assert.equal(err.message, 'No project subdomain provided. Please use `--project`.');
      return done();
    }));

  it('should error if email is invalid', done =>
    login({ project: 'subdomain', email: 'this-is-not-an-email' }).catch(err => {
      assert.equal(err.message, 'You must provide a valid email address.');
      return done();
    }));

  it('should post to /login on the API', () => {
    const email = 'dom@readme.io';
    const password = '123456';
    const project = 'subdomain';
    const apiKey = 'abcdefg';

    const mock = nock(config.host)
      .post('/api/v1/login', { email, password, project })
      .reply(200, { apiKey });

    return login({ email, password, project }).then(() => {
      mock.done();
      assert.equal(configStore.get('apiKey'), apiKey);
      assert.equal(configStore.get('email'), email);
      assert.equal(configStore.get('project'), project);
      configStore.clear();
    });
  });

  it('should error if invalid credentials are given', done => {
    const email = 'dom@readme.io';
    const password = '123456';
    const project = 'subdomain';

    const mock = nock(config.host)
      .post('/api/v1/login', { email, password, project })
      .reply(400, {
        description: 'Invalid email/password',
        error: 'Bad Request',
      });

    return login({ email, password, project }).catch(err => {
      mock.done();
      assert.equal(err.error, 'Bad Request');
      assert.equal(err.description, 'Invalid email/password');
      return done();
    });
  });

  it('should error if missing two factor token', done => {
    const email = 'dom@readme.io';
    const password = '123456';
    const project = 'subdomain';

    const mock = nock(config.host)
      .post('/api/v1/login', { email, password, project })
      .reply(400, {
        description: 'You must provide a Two Factor Code',
        error: 'Bad Request',
      });

    return login({ email, password, project }).catch(err => {
      mock.done();
      assert.equal(err.error, 'Bad Request');
      assert.equal(err.description, 'You must provide a Two Factor Code');
      return done();
    });
  });

  it('should send 2fa token if provided', () => {
    const email = 'dom@readme.io';
    const password = '123456';
    const project = 'subdomain';
    const token = '123456';

    const mock = nock(config.host)
      .post('/api/v1/login', { email, password, project, token })
      .reply(200, { apiKey: '123' });

    return login({ email, password, project, token }).then(() => {
      mock.done();
    });
  });

  it('should error if trying to access a project that is not yours', () => {});
});
