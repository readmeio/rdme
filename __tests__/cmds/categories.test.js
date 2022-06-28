const nock = require('nock');

const getApiNock = require('../get-api-nock');

const CategoriesCreateCommand = require('../../src/cmds/categories/create');

const categoriesCreate = new CategoriesCreateCommand();

const key = 'API_KEY';
const version = '1.0.0';

function getNockWithVersionHeader(v) {
  return getApiNock({
    'x-readme-version': v,
  });
}

describe('rdme categories:create', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(categoriesCreate.run({})).rejects.toThrow('No project API key provided. Please use `--key`.');
  });

  describe('new categories', () => {
    it('should create a new category', async () => {
      const getMock = getNockWithVersionHeader(version)
        .get('/api/v1/categories?perPage=10&page=1')
        .basicAuth({ user: key })
        .reply(200, [{ title: 'Existing Category', slug: 'existing-category', type: 'guide' }], {
          'x-total-count': '1',
        });

      const postMock = getNockWithVersionHeader(version)
        .post('/api/v1/categories')
        .basicAuth({ user: key })
        .reply(201, { title: 'New Category', slug: 'new-category', type: 'guide' });

      const versionMock = getApiNock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        categoriesCreate.run({ title: 'New Category', categoryType: 'guide', key, version: '1.0.0' })
      ).resolves.toBe({ title: 'New Category', slug: 'new-category', type: 'guide' });

      getMock.done();
      postMock.done();
      versionMock.done();
    });
  });
});
