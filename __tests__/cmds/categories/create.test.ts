import { http } from 'msw';
import { setupServer } from 'msw/node';
import prompts from 'prompts';
import { describe, beforeAll, afterEach, it, expect, vi } from 'vitest';

import CategoriesCreateCommand from '../../../src/cmds/categories/create.js';
import { getAPIPath, validateHeaders } from '../../helpers/get-api-mock.js';

const categoriesCreate = new CategoriesCreateCommand();

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme categories:create', () => {
  const server = setupServer(
    http.get(getAPIPath(`/api/v1/version/${version}`), ({ request }) => {
      validateHeaders(request.headers, key);
      return Response.json({ version });
    }),
    http.get(getAPIPath('/api/v1/categories'), ({ request }) => {
      validateHeaders(request.headers, key, { 'x-readme-version': version });
      return Response.json([{ title: 'Existing Category', slug: 'existing-category', type: 'guide', id: 456 }], {
        headers: { 'x-total-count': '1' },
      });
    }),
    http.post(getAPIPath('/api/v1/categories'), async ({ request }) => {
      const json = (await request.json()) as Record<string, string>;
      validateHeaders(request.headers, key, { 'x-readme-version': version });
      return Response.json(
        { ...json, id: 123 },
        {
          headers: { 'x-total-count': '1' },
          status: 201,
        },
      );
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
    await expect(categoriesCreate.run({})).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
    consoleInfoSpy.mockRestore();
  });

  it('should error in CI if no API key provided', async () => {
    process.env.TEST_RDME_CI = 'true';
    // @ts-expect-error deliberately passing in bad data
    await expect(categoriesCreate.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.'),
    );
    delete process.env.TEST_RDME_CI;
  });

  it('should error if no title provided', () => {
    return expect(categoriesCreate.run({ key: '123' })).rejects.toStrictEqual(
      new Error('No title provided. Usage `rdme categories:create <title> [options]`.'),
    );
  });

  it('should error if categoryType is blank', () => {
    return expect(categoriesCreate.run({ key: '123', title: 'Test Title' })).rejects.toStrictEqual(
      new Error('`categoryType` must be `guide` or `reference`.'),
    );
  });

  it('should error if categoryType is not `guide` or `reference`', () => {
    return expect(
      // @ts-expect-error Testing a CLI arg failure case.
      categoriesCreate.run({ key: '123', title: 'Test Title', categoryType: 'test' }),
    ).rejects.toStrictEqual(new Error('`categoryType` must be `guide` or `reference`.'));
  });

  it('should create a new category if the title and type do not match and preventDuplicates=true', () => {
    return expect(
      categoriesCreate.run({
        title: 'New Category',
        categoryType: 'guide',
        key,
        version: '1.0.0',
        preventDuplicates: true,
      }),
    ).resolves.toBe("🌱 successfully created 'New Category' with a type of 'guide' and an id of '123'");
  });

  it('should create a new category if the title matches but the type does not match and preventDuplicates=true', () => {
    return expect(
      categoriesCreate.run({
        title: 'Category',
        categoryType: 'reference',
        key,
        version: '1.0.0',
        preventDuplicates: true,
      }),
    ).resolves.toBe("🌱 successfully created 'Category' with a type of 'reference' and an id of '123'");
  });

  it('should create a new category if the title and type match and preventDuplicates=false', () => {
    return expect(
      categoriesCreate.run({
        title: 'Category',
        categoryType: 'reference',
        key,
        version: '1.0.0',
      }),
    ).resolves.toBe("🌱 successfully created 'Category' with a type of 'reference' and an id of '123'");
  });

  it('should not create a new category if the title and type match and preventDuplicates=true', () => {
    return expect(
      categoriesCreate.run({
        title: 'Existing Category',
        categoryType: 'guide',
        key,
        version: '1.0.0',
        preventDuplicates: true,
      }),
    ).rejects.toStrictEqual(
      new Error(
        "The 'Existing Category' category with a type of 'guide' already exists with an id of '456'. A new category was not created.",
      ),
    );
  });

  it('should not create a new category if the non case sensitive title and type match and preventDuplicates=true', () => {
    return expect(
      categoriesCreate.run({
        title: 'existing category',
        categoryType: 'guide',
        key,
        version: '1.0.0',
        preventDuplicates: true,
      }),
    ).rejects.toStrictEqual(
      new Error(
        "The 'Existing Category' category with a type of 'guide' already exists with an id of '456'. A new category was not created.",
      ),
    );
  });
});
