const nock = require('nock');
const config = require('config');
const configStore = require('../../lib/configstore');
const cmd = require('../../cmds/login');

describe('rdme login', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  afterEach(() => configStore.clear());

  it('should error if no project provided', () => {
    return expect(cmd.run({})).rejects.toThrow('No project subdomain provided. Please use `--project`.');
  });

  it('should error if email is invalid', () => {
    expect.assertions(1);
    return expect(cmd.run({ project: 'subdomain', email: 'this-is-not-an-email' })).rejects.toThrow(
      'You must provide a valid email address.'
    );
  });

  it('should post to /login on the API', () => {
    expect.assertions(3);
    const email = 'dom@readme.io';
    const password = '123456';
    const project = 'subdomain';
    const apiKey = 'abcdefg';

    const mock = nock(config.host)
      .post('/api/v1/login', { email, password, project })
      .reply(200, { apiKey });

    return cmd.run({ email, password, project }).then(() => {
      mock.done();
      expect(configStore.get('apiKey')).toBe(apiKey);
      expect(configStore.get('email')).toBe(email);
      expect(configStore.get('project')).toBe(project);
      configStore.clear();
    });
  });

  it('should error if invalid credentials are given', () => {
    expect.assertions(2);
    const email = 'dom@readme.io';
    const password = '123456';
    const project = 'subdomain';

    const mock = nock(config.host)
      .post('/api/v1/login', { email, password, project })
      .reply(400, {
        description: 'Invalid email/password',
        error: 'Bad Request',
      });

    return cmd.run({ email, password, project }).catch(err => {
      mock.done();
      expect(err.error).toBe('Bad Request');
      expect(err.description).toBe('Invalid email/password');
    });
  });

  it('should error if missing two factor token', () => {
    expect.assertions(2);
    const email = 'dom@readme.io';
    const password = '123456';
    const project = 'subdomain';

    const mock = nock(config.host)
      .post('/api/v1/login', { email, password, project })
      .reply(400, {
        description: 'You must provide a Two Factor Code',
        error: 'Bad Request',
      });

    return cmd.run({ email, password, project }).catch(err => {
      mock.done();
      expect(err.error).toBe('Bad Request');
      expect(err.description).toBe('You must provide a Two Factor Code');
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

    return cmd.run({ email, password, project, token }).then(() => {
      mock.done();
    });
  });

  it.todo('should error if trying to access a project that is not yours');
});
