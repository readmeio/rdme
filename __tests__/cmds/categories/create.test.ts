import nock from 'nock';
import prompts from 'prompts';

import CategoriesCreateCommand from '../../../src/cmds/categories/create';
import getAPIMock, { getAPIMockWithVersionHeader } from '../../helpers/get-api-mock';

const categoriesCreate = new CategoriesCreateCommand();

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme categories:create', () => {
  beforeAll(() => nock.disableNetConnect());

  afterEach(() => nock.cleanAll());

  it('should prompt for login if no API key provided', async () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    prompts.inject(['this-is-not-an-email', 'password', 'subdomain']);
    await expect(categoriesCreate.run({})).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
    consoleInfoSpy.mockRestore();
  });

  it('should error in CI if no API key provided', async () => {
    process.env.TEST_CI = 'true';
    await expect(categoriesCreate.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.')
    );
    delete process.env.TEST_CI;
  });

  it('should error if no title provided', () => {
    return expect(categoriesCreate.run({ key: '123' })).rejects.toStrictEqual(
      new Error('No title provided. Usage `rdme categories:create <title> [options]`.')
    );
  });

  it('should error if categoryType is blank', () => {
    return expect(categoriesCreate.run({ key: '123', title: 'Test Title' })).rejects.toStrictEqual(
      new Error('`categoryType` must be `guide` or `reference`.')
    );
  });

  it('should error if categoryType is not `guide` or `reference`', () => {
    return expect(
      // @ts-expect-error Testing a CLI arg failure case.
      categoriesCreate.run({ key: '123', title: 'Test Title', categoryType: 'test' })
    ).rejects.toStrictEqual(new Error('`categoryType` must be `guide` or `reference`.'));
  });

  it('should create a new category if the title and type do not match and preventDuplicates=true', async () => {
    const getMock = getAPIMockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'Existing Category', slug: 'existing-category', type: 'guide' }], {
        'x-total-count': '1',
      });

    const postMock = getAPIMockWithVersionHeader(version)
      .post('/api/v1/categories')
      .basicAuth({ user: key })
      .reply(201, { title: 'New Category', slug: 'new-category', type: 'guide', id: '123' });

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(
      categoriesCreate.run({
        title: 'New Category',
        categoryType: 'guide',
        key,
        version: '1.0.0',
        preventDuplicates: true,
      })
    ).resolves.toBe("🌱 successfully created 'New Category' with a type of 'guide' and an id of '123'");

    getMock.done();
    postMock.done();
    versionMock.done();
  });

  it('should create a new category if the title matches but the type does not match and preventDuplicates=true', async () => {
    const getMock = getAPIMockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'Category', slug: 'category', type: 'guide' }], {
        'x-total-count': '1',
      });

    const postMock = getAPIMockWithVersionHeader(version)
      .post('/api/v1/categories')
      .basicAuth({ user: key })
      .reply(201, { title: 'Category', slug: 'category', type: 'reference', id: '123' });

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(
      categoriesCreate.run({
        title: 'Category',
        categoryType: 'reference',
        key,
        version: '1.0.0',
        preventDuplicates: true,
      })
    ).resolves.toBe("🌱 successfully created 'Category' with a type of 'reference' and an id of '123'");

    getMock.done();
    postMock.done();
    versionMock.done();
  });

  it('should create a new category if the title and type match and preventDuplicates=false', async () => {
    const postMock = getAPIMockWithVersionHeader(version)
      .post('/api/v1/categories')
      .basicAuth({ user: key })
      .reply(201, { title: 'Category', slug: 'category', type: 'reference', id: '123' });

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(
      categoriesCreate.run({
        title: 'Category',
        categoryType: 'guide',
        key,
        version: '1.0.0',
      })
    ).resolves.toBe("🌱 successfully created 'Category' with a type of 'reference' and an id of '123'");

    postMock.done();
    versionMock.done();
  });

  it('should not create a new category if the title and type match and preventDuplicates=true', async () => {
    const getMock = getAPIMockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'Category', slug: 'category', type: 'guide', id: '123' }], {
        'x-total-count': '1',
      });

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(
      categoriesCreate.run({
        title: 'Category',
        categoryType: 'guide',
        key,
        version: '1.0.0',
        preventDuplicates: true,
      })
    ).rejects.toStrictEqual(
      new Error(
        "The 'Category' category with a type of 'guide' already exists with an id of '123'. A new category was not created."
      )
    );

    getMock.done();
    versionMock.done();
  });

  it('should not create a new category if the non case sensitive title and type match and preventDuplicates=true', async () => {
    const getMock = getAPIMockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'Category', slug: 'category', type: 'guide', id: '123' }], {
        'x-total-count': '1',
      });

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(
      categoriesCreate.run({
        title: 'category',
        categoryType: 'guide',
        key,
        version: '1.0.0',
        preventDuplicates: true,
      })
    ).rejects.toStrictEqual(
      new Error(
        "The 'Category' category with a type of 'guide' already exists with an id of '123'. A new category was not created."
      )
    );

    getMock.done();
    versionMock.done();
  });
});
