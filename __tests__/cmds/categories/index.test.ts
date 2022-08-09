import nock from 'nock';

import CategoriesCommand from '../../../src/cmds/categories';
import getAPIMock, { getAPIMockWithVersionHeader } from '../../helpers/get-api-mock';

const categories = new CategoriesCommand();

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme categories', () => {
  beforeAll(() => nock.disableNetConnect());

  afterEach(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(categories.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.')
    );
  });

  it('should return all categories for a single page', async () => {
    const getMock = getAPIMockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'One Category', slug: 'one-category', type: 'guide' }], {
        'x-total-count': '1',
      });

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(categories.run({ key, version: '1.0.0' })).resolves.toBe(
      JSON.stringify([{ title: 'One Category', slug: 'one-category', type: 'guide' }], null, 2)
    );

    getMock.done();
    versionMock.done();
  });

  it('should return all categories for multiple pages', async () => {
    const getMock = getAPIMockWithVersionHeader(version)
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

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

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
