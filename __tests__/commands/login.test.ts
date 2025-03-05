import prompts from 'prompts';
import { describe, beforeAll, afterEach, it, expect } from 'vitest';

import Command from '../../src/commands/login.js';
import { APIv1Error } from '../../src/lib/apiError.js';
import configStore from '../../src/lib/configstore.js';
import { getAPIv1Mock } from '../helpers/get-api-mock.js';
import { runCommand, type OclifOutput } from '../helpers/oclif.js';

const apiKey = 'abcdefg';
const email = 'user@example.com';
const password = 'password';
const project = 'subdomain';
const token = '123456';

describe('rdme login', () => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(Command);
  });

  afterEach(() => configStore.clear());

  it('should error if no project provided', () => {
    prompts.inject([email, password]);
    return expect(run()).resolves.toMatchSnapshot();
  });

  it('should error if email is invalid', () => {
    prompts.inject(['this-is-not-an-email', password, project]);
    return expect(run()).resolves.toMatchSnapshot();
  });

  it('should post to /login on the API', async () => {
    prompts.inject([email, password, project]);

    const mock = getAPIv1Mock().post('/api/v1/login', { email, password, project }).reply(200, { apiKey });

    await expect(run()).resolves.toMatchSnapshot();

    mock.done();

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should post to /login on the API if passing in project via opt', async () => {
    prompts.inject([email, password]);

    const mock = getAPIv1Mock().post('/api/v1/login', { email, password, project }).reply(200, { apiKey });

    await expect(run(['--project', project])).resolves.toMatchSnapshot();

    mock.done();

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should bypass prompts and post to /login on the API if passing in every opt', async () => {
    const mock = getAPIv1Mock().post('/api/v1/login', { email, password, project, token }).reply(200, { apiKey });

    await expect(
      run(['--email', email, '--password', password, '--project', project, '--otp', token]),
    ).resolves.toMatchSnapshot();

    mock.done();

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should bypass prompts and post to /login on the API if passing in every opt (no 2FA)', async () => {
    const mock = getAPIv1Mock().post('/api/v1/login', { email, password, project }).reply(200, { apiKey });

    await expect(run(['--email', email, '--password', password, '--project', project])).resolves.toMatchSnapshot();

    mock.done();

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should error if invalid credentials are given', async () => {
    prompts.inject([email, password, project]);
    const errorResponse = {
      error: 'LOGIN_INVALID',
      message: 'Either your email address or password is incorrect',
      suggestion: 'You can reset your password at https://dash.readme.com/forgot',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    const mock = getAPIv1Mock().post('/api/v1/login', { email, password, project }).reply(401, errorResponse);

    await expect(run()).resolves.toMatchSnapshot();

    mock.done();
  });

  it('should make additional prompt for token if login requires 2FA', async () => {
    prompts.inject([email, password, project, token]);
    const errorResponse = {
      error: 'LOGIN_TWOFACTOR',
      message: 'You must provide a two-factor code',
      suggestion: 'You can do it via the API using `token`, or via the CLI using `rdme login --2fa`',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    const mock = getAPIv1Mock()
      .post('/api/v1/login', { email, password, project })
      .reply(401, errorResponse)
      .post('/api/v1/login', { email, password, project, token })
      .reply(200, { apiKey });

    await expect(run()).resolves.toMatchSnapshot();

    mock.done();

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should error if trying to access a project that is not yours', async () => {
    const projectThatIsNotYours = 'unauthorized-project';
    prompts.inject([email, password, projectThatIsNotYours]);
    const errorResponse = {
      error: 'PROJECT_NOTFOUND',
      message: `The project (${projectThatIsNotYours}) can't be found.`,
      suggestion: `The project is referred to as your \`subdomain\` in the dashboard when you're looking for it. If you're sure it exists, maybe you don't have access to it? You can check if it exists here: https://${projectThatIsNotYours}.readme.io.`,
      help: 'If you need help, email support@readme.io',
    };

    const mock = getAPIv1Mock()
      .post('/api/v1/login', { email, password, project: projectThatIsNotYours })
      .reply(404, errorResponse);

    await expect(run()).resolves.toMatchSnapshot();

    mock.done();
  });
});
