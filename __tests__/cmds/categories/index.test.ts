import { http } from 'msw';
import { setupServer } from 'msw/node';
import prompts from 'prompts';
import { describe, beforeAll, afterEach, it, expect, vi } from 'vitest';

import CategoriesCommand from '../../../src/cmds/categories/index.js';
import { getAPIPath, validateHeaders } from '../../helpers/get-api-mock.js';

const categories = new CategoriesCommand();

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme categories', () => {
  const server = setupServer(
    http.get(getAPIPath(`/api/v1/version/${version}`), ({ request }) => {
      validateHeaders(request.headers, key);
      return Response.json({ version });
    }),
  );

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('should prompt for login if no API key provided', async () => {
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    prompts.inject(['this-is-not-an-email', 'password', 'subdomain']);
    // @ts-expect-error deliberately passing in bad data
    await expect(categories.run({})).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
    consoleInfoSpy.mockRestore();
  });

  it('should error in CI if no API key provided', async () => {
    process.env.TEST_RDME_CI = 'true';
    // @ts-expect-error deliberately passing in bad data
    await expect(categories.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.'),
    );
    delete process.env.TEST_RDME_CI;
  });

  it('should return all categories for a single page', () => {
    server.use(
      http.get(getAPIPath('/api/v1/categories'), ({ request }) => {
        validateHeaders(request.headers, key, { 'x-readme-version': version });
        return Response.json([{ title: 'One Category', slug: 'one-category', type: 'guide' }], {
          headers: { 'x-total-count': '1' },
        });
      }),
    );

    return expect(categories.run({ key, version: '1.0.0' })).resolves.toBe(
      JSON.stringify([{ title: 'One Category', slug: 'one-category', type: 'guide' }], null, 2),
    );
  });

  it('should return all categories for multiple pages', () => {
    server.use(
      http.get(getAPIPath('/api/v1/categories'), ({ request }) => {
        validateHeaders(request.headers, key, { 'x-readme-version': version });
        const { searchParams } = new URL(request.url);
        if (searchParams.get('perPage') !== '20') {
          return new Response('unexpected perPage query parameter', { status: 400 });
        }
        let payload = [];
        switch (searchParams.get('page')) {
          case '1':
            payload = [{ title: 'One Category', slug: 'one-category', type: 'guide' }];
            break;

          case '2':
            payload = [{ title: 'Another Category', slug: 'another-category', type: 'guide' }];
            break;

          default:
            return new Response('unexpected page query parameter', { status: 400 });
        }

        return Response.json(payload, {
          headers: { 'x-total-count': '21' },
        });
      }),
    );

    return expect(categories.run({ key, version: '1.0.0' })).resolves.toBe(
      JSON.stringify(
        [
          { title: 'One Category', slug: 'one-category', type: 'guide' },
          { title: 'Another Category', slug: 'another-category', type: 'guide' },
        ],
        null,
        2,
      ),
    );
  });
});
