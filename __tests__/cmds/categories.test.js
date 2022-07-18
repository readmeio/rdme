const nock = require('nock');

const getApiNock = require('../get-api-nock');

const CategoriesCommand = require('../../src/cmds/categories');
const CategoriesCreateCommand = require('../../src/cmds/categories/create');

const categories = new CategoriesCommand();
const categoriesCreate = new CategoriesCreateCommand();

const key = 'API_KEY';
const version = '1.0.0';

function getNockWithVersionHeader(v) {
  return getApiNock({
    'x-readme-version': v,
  });
}

describe('rdme categories', () => {
  beforeAll(() => nock.disableNetConnect());

  afterEach(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(categories.run({})).rejects.toThrow('No project API key provided. Please use `--key`.');
  });

  it('should return all categories for a single pages', async () => {
    const getMock = getNockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'One Category', slug: 'one-category', type: 'guide' }], {
        'x-total-count': '1',
      });

    const versionMock = getApiNock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(categories.run({ key, version: '1.0.0' })).resolves.toBe(
      JSON.stringify([{ title: 'One Category', slug: 'one-category', type: 'guide' }], null, 2)
    );

    getMock.done();
    versionMock.done();
  });

  it('should return all categories for multiple pages', async () => {
    const getMock = getNockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'One Category', slug: 'one-category', type: 'guide' }], {
        'x-total-count': '21',
      })
      .get('/api/v1/categories?perPage=20&page=2')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'Another Category', slug: 'another-category', type: 'guide' }], {
        'x-total-count': '21',
      });

    const versionMock = getApiNock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(categories.run({ key, version: '1.0.0' })).resolves.toBe(
      JSON.stringify(
        [
          { title: 'One Category', slug: 'one-category', type: 'guide' },
          { title: 'Another Category', slug: 'another-category', type: 'guide' },
        ],
        null,
        2
      )
    );

    getMock.done();
    versionMock.done();
  });
});

describe('rdme categories:create', () => {
  beforeAll(() => nock.disableNetConnect());

  afterEach(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(categoriesCreate.run({})).rejects.toThrow('No project API key provided. Please use `--key`.');
  });

  it('should error if no title provided', () => {
    return expect(categoriesCreate.run({ key: '123' })).rejects.toThrow(
      'No title provided. Usage `rdme categories:create <title> [options]`.'
    );
  });

  it('should error if categoryType is blank', () => {
    return expect(categoriesCreate.run({ key: '123', title: 'Test Title' })).rejects.toThrow(
      '`categoryType` must be `guide` or `reference`.'
    );
  });

  it('should error if categoryType is not `guide` or `reference`', () => {
    return expect(categoriesCreate.run({ key: '123', title: 'Test Title', categoryType: 'test' })).rejects.toThrow(
      '`categoryType` must be `guide` or `reference`.'
    );
  });

  it('should create a new category if the title and type do not match and the preventDuplicates flag is checked', async () => {
    const getMock = getNockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'Existing Category', slug: 'existing-category', type: 'guide' }], {
        'x-total-count': '1',
      });

    const postMock = getNockWithVersionHeader(version)
      .post('/api/v1/categories')
      .basicAuth({ user: key })
      .reply(201, { title: 'New Category', slug: 'new-category', type: 'guide', id: '123' });

    const versionMock = getApiNock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

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

  it('should create a new category if the title matches but the type does not match and the preventDuplicates flag is checked', async () => {
    const getMock = getNockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'Category', slug: 'category', type: 'guide' }], {
        'x-total-count': '1',
      });

    const postMock = getNockWithVersionHeader(version)
      .post('/api/v1/categories')
      .basicAuth({ user: key })
      .reply(201, { title: 'Category', slug: 'category', type: 'reference', id: '123' });

    const versionMock = getApiNock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

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

  it('should create a new category if the title and type match and the preventDuplicates flag is not checked', async () => {
    const postMock = getNockWithVersionHeader(version)
      .post('/api/v1/categories')
      .basicAuth({ user: key })
      .reply(201, { title: 'Category', slug: 'category', type: 'reference', id: '123' });

    const versionMock = getApiNock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

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

  it('should not create a new category if the title and type match and the preventDuplicates flag is checked', async () => {
    const getMock = getNockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'Category', slug: 'category', type: 'guide', id: '123' }], {
        'x-total-count': '1',
      });

    const versionMock = getApiNock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(
      categoriesCreate.run({
        title: 'Category',
        categoryType: 'guide',
        key,
        version: '1.0.0',
        preventDuplicates: true,
      })
    ).resolves.toBe(
      "The 'Category' category with a type of 'guide' already exists with an id of '123'. A new category was not created"
    );

    getMock.done();
    versionMock.done();
  });

  it('should not create a new category if the non case sensitive title and type match and the preventDuplicates flag is checked', async () => {
    const getMock = getNockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'Category', slug: 'category', type: 'guide', id: '123' }], {
        'x-total-count': '1',
      });

    const versionMock = getApiNock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(
      categoriesCreate.run({
        title: 'category',
        categoryType: 'guide',
        key,
        version: '1.0.0',
        preventDuplicates: true,
      })
    ).resolves.toBe(
      "The 'Category' category with a type of 'guide' already exists with an id of '123'. A new category was not created"
    );

    getMock.done();
    versionMock.done();
  });
});
