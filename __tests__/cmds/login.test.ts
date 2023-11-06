/* eslint-disable vitest/no-standalone-expect */
import type { LoginBody } from '../../src/lib/loginFlow.js';

import { http } from 'msw';
import { setupServer } from 'msw/node';
import prompts from 'prompts';
import { describe, beforeAll, afterEach, it, expect } from 'vitest';

import Command from '../../src/cmds/login.js';
import APIError from '../../src/lib/apiError.js';
import configStore from '../../src/lib/configstore.js';
import { getAPIPath } from '../helpers/get-api-mock.js';

const cmd = new Command();

const apiKey = 'abcdefg';
const email = 'user@example.com';
const password = 'password';
const project = 'subdomain';
const token = '123456';

describe('rdme login', () => {
  const server = setupServer(
    http.post(getAPIPath('/api/v1/login'), async ({ request }) => {
      const json = (await request.json()) as LoginBody;
      expect(json.email).toBe(email);
      expect(json.password).toBe(password);
      expect(json.project).toBe(project);
      if (json.token) {
        expect(json.token).toBe(token);
      }
      return Response.json({ apiKey });
    }),
  );

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    configStore.clear();
    server.resetHandlers();
  });

  it('should error if no project provided', () => {
    prompts.inject([email, password]);
    return expect(cmd.run({})).rejects.toStrictEqual(
      new Error('No project subdomain provided. Please use `--project`.'),
    );
  });

  it('should error if email is invalid', () => {
    prompts.inject(['this-is-not-an-email', password, project]);
    return expect(cmd.run({})).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
  });

  it('should post to /login on the API', async () => {
    prompts.inject([email, password, project]);

    await expect(cmd.run({})).resolves.toBe('Successfully logged in as user@example.com to the subdomain project.');

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should post to /login on the API if passing in project via opt', async () => {
    prompts.inject([email, password]);

    await expect(cmd.run({ project })).resolves.toBe(
      'Successfully logged in as user@example.com to the subdomain project.',
    );

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should bypass prompts and post to /login on the API if passing in every opt', async () => {
    await expect(cmd.run({ email, password, project, otp: token })).resolves.toBe(
      'Successfully logged in as user@example.com to the subdomain project.',
    );

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should bypass prompts and post to /login on the API if passing in every opt (no 2FA)', async () => {
    await expect(cmd.run({ email, password, project })).resolves.toBe(
      'Successfully logged in as user@example.com to the subdomain project.',
    );

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should error if invalid credentials are given', () => {
    prompts.inject([email, password, project]);
    const errorResponse = {
      error: 'LOGIN_INVALID',
      message: 'Either your email address or password is incorrect',
      suggestion: 'You can reset your password at https://dash.readme.com/forgot',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    server.use(
      http.post(getAPIPath('/api/v1/login'), async ({ request }) => {
        const json = (await request.json()) as LoginBody;
        expect(json.email).toBe(email);
        expect(json.password).toBe(password);
        expect(json.project).toBe(project);
        return Response.json(errorResponse, { status: 401 });
      }),
    );

    return expect(cmd.run({})).rejects.toStrictEqual(new APIError(errorResponse));
  });

  it('should make additional prompt for token if login requires 2FA', async () => {
    prompts.inject([email, password, project, token]);
    const errorResponse = {
      error: 'LOGIN_TWOFACTOR',
      message: 'You must provide a two-factor code',
      suggestion: 'You can do it via the API using `token`, or via the CLI using `rdme login --2fa`',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    server.use(
      http.post(
        getAPIPath('/api/v1/login'),
        async ({ request }) => {
          const json = (await request.json()) as LoginBody;
          expect(json.email).toBe(email);
          expect(json.password).toBe(password);
          expect(json.project).toBe(project);
          return Response.json(errorResponse, { status: 401 });
        },
        { once: true }, // once flag is so it returns a 401 once and then a 200 on subsequent calls
      ),
    );

    await expect(cmd.run({})).resolves.toBe('Successfully logged in as user@example.com to the subdomain project.');

    expect(configStore.get('apiKey')).toBe(apiKey);
    expect(configStore.get('email')).toBe(email);
    expect(configStore.get('project')).toBe(project);
  });

  it('should error if trying to access a project that is not yours', () => {
    const projectThatIsNotYours = 'unauthorized-project';
    prompts.inject([email, password, projectThatIsNotYours]);
    const errorResponse = {
      error: 'PROJECT_NOTFOUND',
      message: `The project (${projectThatIsNotYours}) can't be found.`,
      suggestion: `The project is referred to as your \`subdomain\` in the dashboard when you're looking for it. If you're sure it exists, maybe you don't have access to it? You can check if it exists here: https://${projectThatIsNotYours}.readme.io.`,
      help: 'If you need help, email support@readme.io',
    };

    server.use(
      http.post(getAPIPath('/api/v1/login'), async ({ request }) => {
        const json = (await request.json()) as LoginBody;
        expect(json.email).toBe(email);
        expect(json.password).toBe(password);
        expect(json.project).toBe(projectThatIsNotYours);
        return Response.json(errorResponse, { status: 404 });
      }),
    );

    return expect(cmd.run({})).rejects.toStrictEqual(new APIError(errorResponse));
  });
});
