import type { Config } from '@oclif/core';

import nock from 'nock';
import prompts from 'prompts';
import { describe, beforeAll, beforeEach, afterAll, afterEach, it, expect } from 'vitest';

import APIError from '../../src/lib/apiError.js';
import configStore from '../../src/lib/configstore.js';
import getAPIMock from '../helpers/get-api-mock.js';
import setupOclifConfig from '../helpers/setup-oclif-config.js';

const apiKey = 'abcdefg';
const email = 'user@example.com';
const password = 'password';
const project = 'subdomain';
const token = '123456';

describe('rdme login', () => {
  let oclifConfig: Config;
  let run: (args?: string[]) => Promise<unknown>;

  beforeAll(() => {
    nock.disableNetConnect();
  });

  beforeEach(async () => {
    oclifConfig = await setupOclifConfig();
    run = (args?: string[]) => oclifConfig.runCommand('login', args);
  });

  afterEach(() => configStore.clear());

  afterAll(() => nock.cleanAll());

  it('should error if no project provided', () => {
    prompts.inject([email, password]);
    return expect(run()).rejects.toStrictEqual(new Error('No project subdomain provided. Please use `--project`.'));
  });

  it('should error if email is invalid', () => {
    prompts.inject(['this-is-not-an-email', password, project]);
    return expect(run()).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
  });

  it('should post to /login on the API', async () => {
    prompts.inject([email, password, project]);

    const mock = getAPIMock().post('/api/v1/login', { email, password, project }).reply(200, { apiKey });

    await expect(run()).resolves.toBe('Successfully logged in as user@example.com to the subdomain project.');

    mock.done();

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should post to /login on the API if passing in project via opt', async () => {
    prompts.inject([email, password]);

    const mock = getAPIMock().post('/api/v1/login', { email, password, project }).reply(200, { apiKey });

    await expect(run(['--project', project])).resolves.toBe(
      'Successfully logged in as user@example.com to the subdomain project.',
    );

    mock.done();

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should bypass prompts and post to /login on the API if passing in every opt', async () => {
    const mock = getAPIMock().post('/api/v1/login', { email, password, project, token }).reply(200, { apiKey });

    await expect(run(['--email', email, '--password', password, '--project', project, '--otp', token])).resolves.toBe(
      'Successfully logged in as user@example.com to the subdomain project.',
    );

    mock.done();

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should bypass prompts and post to /login on the API if passing in every opt (no 2FA)', async () => {
    const mock = getAPIMock().post('/api/v1/login', { email, password, project }).reply(200, { apiKey });

    await expect(run(['--email', email, '--password', password, '--project', project])).resolves.toBe(
      'Successfully logged in as user@example.com to the subdomain project.',
    );

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

    const mock = getAPIMock().post('/api/v1/login', { email, password, project }).reply(401, errorResponse);

    await expect(run()).rejects.toThrow(new APIError(errorResponse));
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

    const mock = getAPIMock()
      .post('/api/v1/login', { email, password, project })
      .reply(401, errorResponse)
      .post('/api/v1/login', { email, password, project, token })
      .reply(200, { apiKey });

    await expect(run()).resolves.toBe('Successfully logged in as user@example.com to the subdomain project.');

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

    const mock = getAPIMock()
      .post('/api/v1/login', { email, password, project: projectThatIsNotYours })
      .reply(404, errorResponse);

    await expect(run()).rejects.toThrow(new APIError(errorResponse));
    mock.done();
  });
});
