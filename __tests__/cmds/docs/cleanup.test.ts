import nock from 'nock';
import prompts from 'prompts';

import DocsCleanupCommand from '../../../src/cmds/docs/cleanup';
import getAPIMock, { getAPIMockWithVersionHeader } from '../../helpers/get-api-mock';

const docsCleanup = new DocsCleanupCommand();

const fixturesBaseDir = '__fixtures__/docs';

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme docs:cleanup', () => {
  const folder = `./__tests__/${fixturesBaseDir}/delete-docs`;
  let consoleWarnSpy;

  function getWarningCommandOutput() {
    return [consoleWarnSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
  }

  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should prompt for login if no API key provided', async () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    prompts.inject(['this-is-not-an-email', 'password', 'subdomain']);
    await expect(docsCleanup.run({})).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
    consoleInfoSpy.mockRestore();
  });

  it('should error in CI if no API key provided', async () => {
    process.env.TEST_CI = 'true';
    await expect(docsCleanup.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.')
    );
    delete process.env.TEST_CI;
  });

  it('should error if no folder provided', () => {
    return expect(docsCleanup.run({ key, version: '1.0.0' })).rejects.toThrow(
      'No folder provided. Usage `rdme docs:cleanup <folder> [options]`.'
    );
  });

  it('should error if the argument is not a folder', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docsCleanup.run({ key, version: '1.0.0', folder: 'not-a-folder' })).rejects.toThrow(
      "ENOENT: no such file or directory, scandir 'not-a-folder'"
    );

    versionMock.done();
  });

  it('should do nothing if the folder is empty and the user aborted', async () => {
    prompts.inject([false]);

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(
      docsCleanup.run({
        folder: '.github/workflows',
        key,
        version,
      })
    ).rejects.toStrictEqual(new Error('Aborting, no changes were made.'));

    const warningOutput = getWarningCommandOutput();
    expect(warningOutput).toBe('');

    versionMock.done();
  });

  it('should delete doc if file is missing', async () => {
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
      docsCleanup.run({
        folder,
        key,
        version,
      })
    ).resolves.toBe('🗑️ successfully deleted `this-doc-should-be-missing-in-folder`.');
    const warningOutput = getWarningCommandOutput();
    expect(warningOutput).toBe(
      "⚠️  Warning! We're going to delete from ReadMe any document that isn't found in ./__tests__/__fixtures__/docs/delete-docs."
    );

    apiMocks.done();
    versionMock.done();
  });

  it('should return doc delete info for dry run', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });
    const apiMocks = getAPIMockWithVersionHeader(version)
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ slug: 'category1', type: 'guide' }], { 'x-total-count': '1' })
      .get('/api/v1/categories/category1/docs')
      .basicAuth({ user: key })
      .reply(200, [{ slug: 'this-doc-should-be-missing-in-folder' }]);

    await expect(
      docsCleanup.run({
        folder,
        key,
        version,
        cleanup: true,
        dryRun: true,
      })
    ).resolves.toBe('🎭 dry run! This will delete `this-doc-should-be-missing-in-folder`.');

    const warningOutput = getWarningCommandOutput();
    expect(warningOutput).toBe(
      "⚠️  Warning! We're going to delete from ReadMe any document that isn't found in ./__tests__/__fixtures__/docs/delete-docs."
    );

    apiMocks.done();
    versionMock.done();
  });
});
