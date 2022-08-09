import nock from 'nock';

import Command from '../../src/cmds/login';
import APIError from '../../src/lib/apiError';
import configStore from '../../src/lib/configstore';
import getAPIMock from '../helpers/get-api-mock';

const cmd = new Command();

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
    const apiKey = 'abcdefg';

    const mock = getAPIMock().post('/api/v1/login', { email, password, project }).reply(200, { apiKey });

    await expect(cmd.run({ email, password, project })).resolves.toMatchSnapshot();

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

    const mock = getAPIMock().post('/api/v1/login', { email, password, project }).reply(401, errorResponse);

    await expect(cmd.run({ email, password, project })).rejects.toStrictEqual(new APIError(errorResponse));
    mock.done();
  });

  it('should error if missing two factor token', async () => {
    const errorResponse = {
      error: 'LOGIN_TWOFACTOR',
      message: 'You must provide a two-factor code',
      suggestion: 'You can do it via the API using `token`, or via the CLI using `rdme login --2fa`',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    const mock = getAPIMock().post('/api/v1/login', { email, password, project }).reply(401, errorResponse);

    await expect(cmd.run({ email, password, project })).rejects.toStrictEqual(new APIError(errorResponse));
    mock.done();
  });

  it('should send 2fa token if provided', async () => {
    const token = '123456';

    const mock = getAPIMock().post('/api/v1/login', { email, password, project, token }).reply(200, { apiKey: '123' });

    await expect(cmd.run({ email, password, project, token })).resolves.toMatchSnapshot();
    mock.done();
  });

  it.todo('should error if trying to access a project that is not yours');
});
