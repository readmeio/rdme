const nock = require('nock');
const config = require('config');
const configStore = require('../../src/lib/configstore');
const cmd = require('../../src/cmds/login');
const APIError = require('../../src/lib/apiError');

const email = 'user@example.com';
const password = '123456';
const project = 'subdomain';

describe('rdme login', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  afterEach(() => configStore.clear());

  it('should error if no project provided', () => {
    return expect(cmd.run({})).rejects.toStrictEqual(
      new Error('No project subdomain provided. Please use `--project`.')
    );
  });

  it('should error if email is invalid', () => {
    return expect(cmd.run({ project: 'subdomain', email: 'this-is-not-an-email' })).rejects.toStrictEqual(
      new Error('You must provide a valid email address.')
    );
  });

  it('should post to /login on the API', async () => {
    expect.assertions(3);
    const apiKey = 'abcdefg';

    const mock = nock(config.get('host')).post('/api/v1/login', { email, password, project }).reply(200, { apiKey });

    await cmd.run({ email, password, project });
    mock.done();

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
    configStore.clear();
  });

  it('should error if invalid credentials are given', async () => {
    const errorResponse = {
      error: 'LOGIN_INVALID',
      message: 'Either your email address or password is incorrect',
      suggestion: 'You can reset your password at https://dash.readme.com/forgot',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    const mock = nock(config.get('host')).post('/api/v1/login', { email, password, project }).reply(401, errorResponse);

    await expect(cmd.run({ email, password, project })).rejects.toThrow(new APIError(errorResponse));
    mock.done();
  });

  it('should error if missing two factor token', async () => {
    const errorResponse = {
      error: 'LOGIN_TWOFACTOR',
      message: 'You must provide a two-factor code',
      suggestion: 'You can do it via the API using `token`, or via the CLI using `rdme login --2fa`',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    const mock = nock(config.get('host')).post('/api/v1/login', { email, password, project }).reply(401, errorResponse);

    await expect(cmd.run({ email, password, project })).rejects.toThrow(new APIError(errorResponse));
    mock.done();
  });

  it('should send 2fa token if provided', async () => {
    const token = '123456';

    const mock = nock(config.get('host'))
      .post('/api/v1/login', { email, password, project, token })
      .reply(200, { apiKey: '123' });

    await cmd.run({ email, password, project, token });
    mock.done();
  });

  it.todo('should error if trying to access a project that is not yours');
});
