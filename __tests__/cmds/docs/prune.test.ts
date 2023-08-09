import nock from 'nock';
import prompts from 'prompts';

import DocsPruneCommand from '../../../src/cmds/docs/prune.js';
import GuidesPruneCommand from '../../../src/cmds/guides/prune.js';
import getAPIMock, { getAPIMockWithVersionHeader } from '../../helpers/get-api-mock';

const docsPrune = new DocsPruneCommand();
const guidesPrune = new GuidesPruneCommand();

const fixturesBaseDir = '__fixtures__/docs';

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme docs:prune', () => {
  const folder = `./__tests__/${fixturesBaseDir}/delete-docs`;

  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  it('should prompt for login if no API key provided', async () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    prompts.inject(['this-is-not-an-email', 'password', 'subdomain']);
    await expect(docsPrune.run({})).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
    consoleInfoSpy.mockRestore();
  });

  it('should error in CI if no API key provided', async () => {
    process.env.TEST_RDME_CI = 'true';
    await expect(docsPrune.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.')
    );
    delete process.env.TEST_RDME_CI;
  });

  it('should error if no folder provided', () => {
    return expect(docsPrune.run({ key, version: '1.0.0' })).rejects.toStrictEqual(
      new Error('No folder provided. Usage `rdme docs:prune <folder> [options]`.')
    );
  });

  it('should error if the argument is not a folder', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docsPrune.run({ key, version: '1.0.0', folder: 'not-a-folder' })).rejects.toThrow(
      "ENOENT: no such file or directory, scandir 'not-a-folder'"
    );

    versionMock.done();
  });

  it('should do nothing if the user aborted', async () => {
    prompts.inject([false]);

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(
      docsPrune.run({
        folder,
        key,
        version,
      })
    ).rejects.toStrictEqual(new Error('Aborting, no changes were made.'));

    versionMock.done();
  });

  it('should not ask for user confirmation if `confirm` is set to true', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    const apiMocks = getAPIMockWithVersionHeader(version)
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ slug: 'category1', type: 'guide' }], { 'x-total-count': '1' })
      .get('/api/v1/categories/category1/docs')
      .basicAuth({ user: key })
      .reply(200, [{ slug: 'this-doc-should-be-missing-in-folder' }, { slug: 'some-doc' }])
      .delete('/api/v1/docs/this-doc-should-be-missing-in-folder')
      .basicAuth({ user: key })
      .reply(204, '');

    await expect(
      docsPrune.run({
        folder,
        key,
        confirm: true,
        version,
      })
    ).resolves.toBe('🗑️  successfully deleted `this-doc-should-be-missing-in-folder`.');

    apiMocks.done();
    versionMock.done();
  });

  it('should delete doc if file is missing', async () => {
    prompts.inject([true]);

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    const apiMocks = getAPIMockWithVersionHeader(version)
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ slug: 'category1', type: 'guide' }], { 'x-total-count': '1' })
      .get('/api/v1/categories/category1/docs')
      .basicAuth({ user: key })
      .reply(200, [{ slug: 'this-doc-should-be-missing-in-folder' }, { slug: 'some-doc' }])
      .delete('/api/v1/docs/this-doc-should-be-missing-in-folder')
      .basicAuth({ user: key })
      .reply(204, '');

    await expect(
      docsPrune.run({
        folder,
        key,
        version,
      })
    ).resolves.toBe('🗑️  successfully deleted `this-doc-should-be-missing-in-folder`.');

    apiMocks.done();
    versionMock.done();
  });

  it('should delete doc and its child if they are missing', async () => {
    prompts.inject([true]);

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    const apiMocks = getAPIMockWithVersionHeader(version)
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ slug: 'category1', type: 'guide' }], { 'x-total-count': '1' })
      .get('/api/v1/categories/category1/docs')
      .basicAuth({ user: key })
      .reply(200, [
        { slug: 'this-doc-should-be-missing-in-folder', children: [{ slug: 'this-child-is-also-missing' }] },
        { slug: 'some-doc' },
      ])
      .delete('/api/v1/docs/this-doc-should-be-missing-in-folder')
      .basicAuth({ user: key })
      .reply(204, '')
      .delete('/api/v1/docs/this-child-is-also-missing')
      .basicAuth({ user: key })
      .reply(204, '');

    await expect(
      docsPrune.run({
        folder,
        key,
        version,
      })
    ).resolves.toBe(
      '🗑️  successfully deleted `this-child-is-also-missing`.\n🗑️  successfully deleted `this-doc-should-be-missing-in-folder`.'
    );

    apiMocks.done();
    versionMock.done();
  });

  it('should return doc delete info for dry run', async () => {
    prompts.inject([true]);

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });
    const apiMocks = getAPIMockWithVersionHeader(version)
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ slug: 'category1', type: 'guide' }], { 'x-total-count': '1' })
      .get('/api/v1/categories/category1/docs')
      .basicAuth({ user: key })
      .reply(200, [{ slug: 'this-doc-should-be-missing-in-folder' }]);

    await expect(
      docsPrune.run({
        folder,
        key,
        version,
        dryRun: true,
      })
    ).resolves.toBe('🎭 dry run! This will delete `this-doc-should-be-missing-in-folder`.');

    apiMocks.done();
    versionMock.done();
  });
});

describe('rdme guides:prune', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  it('should error if no folder provided', () => {
    return expect(guidesPrune.run({ key, version: '1.0.0' })).rejects.toStrictEqual(
      new Error('No folder provided. Usage `rdme guides:prune <folder> [options]`.')
    );
  });
});
