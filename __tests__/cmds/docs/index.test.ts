import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import frontMatter from 'gray-matter';
import nock from 'nock';
import prompts from 'prompts';

import DocsCommand from '../../../src/cmds/docs';
import APIError from '../../../src/lib/apiError';
import getAPIMock, { getAPIMockWithVersionHeader } from '../../helpers/get-api-mock';
import hashFileContents from '../../helpers/hash-file-contents';

const docs = new DocsCommand();

const fixturesBaseDir = '__fixtures__/docs';
const fullFixturesDir = `${__dirname}./../../${fixturesBaseDir}`;

const key = 'API_KEY';
const version = '1.0.0';
const category = 'CATEGORY_ID';
const apiSetting = 'API_SETTING_ID';

describe('rdme docs', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(docs.run({})).rejects.toStrictEqual(new Error('No project API key provided. Please use `--key`.'));
  });

  it('should error if no folder provided', () => {
    return expect(docs.run({ key, version: '1.0.0' })).rejects.toThrow(
      'No folder provided. Usage `rdme docs <folder> [options]`.'
    );
  });

  it('should error if the argument is not a folder', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docs.run({ key, version: '1.0.0', folder: 'not-a-folder' })).rejects.toThrow(
      "ENOENT: no such file or directory, scandir 'not-a-folder'"
    );

    versionMock.done();
  });

  it('should error if the folder contains no markdown files', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docs.run({ key, version: '1.0.0', folder: '.github/workflows' })).rejects.toThrow(
      'We were unable to locate Markdown files in .github/workflows.'
    );

    versionMock.done();
  });

  describe('existing docs', () => {
    let simpleDoc;
    let anotherDoc;

    beforeEach(() => {
      let fileContents = fs.readFileSync(path.join(fullFixturesDir, '/existing-docs/simple-doc.md'));
      simpleDoc = {
        slug: 'simple-doc',
        doc: frontMatter(fileContents),
        hash: hashFileContents(fileContents),
      };

      fileContents = fs.readFileSync(path.join(fullFixturesDir, '/existing-docs/subdir/another-doc.md'));
      anotherDoc = {
        slug: 'another-doc',
        doc: frontMatter(fileContents),
        hash: hashFileContents(fileContents),
      };
    });

    it('should fetch doc and merge with what is returned', () => {
      expect.assertions(1);

      const getMocks = getAPIMockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: 'anOldHash' });

      const updateMocks = getAPIMockWithVersionHeader(version)
        .put('/api/v1/docs/simple-doc', {
          category,
          slug: simpleDoc.slug,
          body: simpleDoc.doc.content,
          lastUpdatedHash: simpleDoc.hash,
          ...simpleDoc.doc.data,
        })
        .basicAuth({ user: key })
        .reply(200, {
          category,
          slug: simpleDoc.slug,
          body: simpleDoc.doc.content,
        })
        .put('/api/v1/docs/another-doc', {
          category,
          slug: anotherDoc.slug,
          body: anotherDoc.doc.content,
          lastUpdatedHash: anotherDoc.hash,
          ...anotherDoc.doc.data,
        })
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, body: anotherDoc.doc.content });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs.run({ folder: `./__tests__/${fixturesBaseDir}/existing-docs`, key, version }).then(updatedDocs => {
        // All docs should have been updated because their hashes from the GET request were different from what they
        // are currently.
        expect(updatedDocs).toBe(
          [
            `✏️ successfully updated 'simple-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`,
            `✏️ successfully updated 'another-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/subdir/another-doc.md`,
          ].join('\n')
        );

        getMocks.done();
        updateMocks.done();
        versionMock.done();
      });
    });

    it('should return doc update info for dry run', () => {
      expect.assertions(1);

      const getMocks = getAPIMockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: 'anOldHash' });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs
        .run({ dryRun: true, folder: `./__tests__/${fixturesBaseDir}/existing-docs`, key, version })
        .then(updatedDocs => {
          // All docs should have been updated because their hashes from the GET request were different from what they
          // are currently.
          expect(updatedDocs).toBe(
            [
              `🎭 dry run! This will update 'simple-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/simple-doc.md with the following metadata: ${JSON.stringify(
                simpleDoc.doc.data
              )}`,
              `🎭 dry run! This will update 'another-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/subdir/another-doc.md with the following metadata: ${JSON.stringify(
                anotherDoc.doc.data
              )}`,
            ].join('\n')
          );

          getMocks.done();
          versionMock.done();
        });
    });

    it('should not send requests for docs that have not changed', () => {
      expect.assertions(1);

      const getMocks = getAPIMockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: anotherDoc.hash });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs.run({ folder: `./__tests__/${fixturesBaseDir}/existing-docs`, key, version }).then(skippedDocs => {
        expect(skippedDocs).toBe(
          [
            '`simple-doc` was not updated because there were no changes.',
            '`another-doc` was not updated because there were no changes.',
          ].join('\n')
        );

        getMocks.done();
        versionMock.done();
      });
    });

    it('should adjust "no changes" message if in dry run', () => {
      expect.assertions(1);

      const getMocks = getAPIMockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: anotherDoc.hash });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs
        .run({ dryRun: true, folder: `./__tests__/${fixturesBaseDir}/existing-docs`, key, version })
        .then(skippedDocs => {
          expect(skippedDocs).toBe(
            [
              '🎭 dry run! `simple-doc` will not be updated because there were no changes.',
              '🎭 dry run! `another-doc` will not be updated because there were no changes.',
            ].join('\n')
          );

          getMocks.done();
          versionMock.done();
        });
    });
  });

  describe('new docs', () => {
    it('should create new doc', async () => {
      const slug = 'new-doc';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getAPIMockWithVersionHeader(version)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIMockWithVersionHeader(version)
        .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(docs.run({ folder: `./__tests__/${fixturesBaseDir}/new-docs`, key, version })).resolves.toBe(
        `🌱 successfully created 'new-doc' with contents from __tests__/${fixturesBaseDir}/new-docs/new-doc.md`
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });

    it('should return creation info for dry run', async () => {
      const slug = 'new-doc';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getAPIMockWithVersionHeader(version)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        docs.run({ dryRun: true, folder: `./__tests__/${fixturesBaseDir}/new-docs`, key, version })
      ).resolves.toBe(
        `🎭 dry run! This will create 'new-doc' with contents from __tests__/${fixturesBaseDir}/new-docs/new-doc.md with the following metadata: ${JSON.stringify(
          doc.data
        )}`
      );

      getMock.done();
      versionMock.done();
    });

    it('should fail if any docs are invalid', async () => {
      const folder = 'failure-docs';
      const slug = 'fail-doc';
      const slugTwo = 'new-doc';

      const errorObject = {
        error: 'DOC_INVALID',
        message: "We couldn't save this doc (Path `category` is required.).",
      };

      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slug}.md`)));
      const docTwo = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slugTwo}.md`)));

      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slug}.md`)));
      const hashTwo = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slugTwo}.md`)));

      const getMocks = getAPIMockWithVersionHeader(version)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        })
        .get(`/api/v1/docs/${slugTwo}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slugTwo}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMocks = getAPIMockWithVersionHeader(version)
        .post('/api/v1/docs', { slug: slugTwo, body: docTwo.content, ...docTwo.data, lastUpdatedHash: hashTwo })
        .basicAuth({ user: key })
        .reply(201, {
          metadata: { image: [], title: '', description: '' },
          api: {
            method: 'post',
            url: '',
            auth: 'required',
            params: [],
            apiSetting,
          },
          title: 'This is the document title',
          updates: [],
          type: 'endpoint',
          slug: slugTwo,
          body: 'Body',
          category,
        })
        .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(400, errorObject);

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      const fullDirectory = `__tests__/${fixturesBaseDir}/${folder}`;

      const formattedErrorObject = {
        ...errorObject,
        message: `Error uploading ${chalk.underline(`${fullDirectory}/${slug}.md`)}:\n\n${errorObject.message}`,
      };

      await expect(docs.run({ folder: `./${fullDirectory}`, key, version })).rejects.toStrictEqual(
        new APIError(formattedErrorObject)
      );

      getMocks.done();
      postMocks.done();
      versionMock.done();
    });
  });

  describe('cleanup docs', () => {
    const folder = `./__tests__/${fixturesBaseDir}/delete-docs`;
    const someDocContent = fs.readFileSync(path.join(folder, 'some-doc.md'));
    const lastUpdatedHash = crypto.createHash('sha1').update(someDocContent).digest('hex');

    it('should delete doc if file is missing and --cleanup option is used', async () => {
      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      const apiMocks = getAPIMockWithVersionHeader(version)
        .get('/api/v1/categories?perPage=20&page=1')
        .basicAuth({ user: key })
        .reply(200, [{ slug: 'category1', type: 'guide' }], { 'x-total-count': '1' })
        .get('/api/v1/categories/category1/docs')
        .basicAuth({ user: key })
        .reply(200, [{ slug: 'this-doc-should-be-missing-in-folder' }, { slug: 'some-doc' }])
        .delete('/api/v1/docs/this-doc-should-be-missing-in-folder')
        .basicAuth({ user: key })
        .reply(204, '')
        .get('/api/v1/docs/some-doc')
        .basicAuth({ user: key })
        .reply(200, { lastUpdatedHash });

      await expect(
        docs.run({
          folder,
          key,
          version,
          cleanup: true,
        })
      ).resolves.toBe(
        'successfully deleted `this-doc-should-be-missing-in-folder`.\n' +
          '`some-doc` was not updated because there were no changes.'
      );

      apiMocks.done();
      versionMock.done();
    });

    it('should return doc delete info for dry run', async () => {
      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });
      const apiMocks = getAPIMockWithVersionHeader(version)
        .get('/api/v1/categories?perPage=20&page=1')
        .basicAuth({ user: key })
        .reply(200, [{ slug: 'category1', type: 'guide' }], { 'x-total-count': '1' })
        .get('/api/v1/categories/category1/docs')
        .basicAuth({ user: key })
        .reply(200, [{ slug: 'this-doc-should-be-missing-in-folder' }])
        .get('/api/v1/docs/some-doc')
        .basicAuth({ user: key })
        .reply(200, { lastUpdatedHash });
      await expect(
        docs.run({
          folder,
          key,
          version,
          cleanup: true,
          dryRun: true,
        })
      ).resolves.toBe(
        '🎭 dry run! This will delete `this-doc-should-be-missing-in-folder`.\n' +
          '🎭 dry run! `some-doc` will not be updated because there were no changes.'
      );
      apiMocks.done();
      versionMock.done();
    });

    it('should do nothing if using --cleanup but thr folder is empty and the user aborted', async () => {
      prompts.inject([false]);

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        docs.run({
          folder: './__tests__/__fixtures__/ref-oas',
          key,
          version,
          cleanup: true,
        })
      ).rejects.toStrictEqual(new Error('Aborting, no changes were made.'));

      versionMock.done();
    });
  });

  describe('slug metadata', () => {
    it('should use provided slug', async () => {
      const slug = 'new-doc-slug';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/slug-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/slug-docs/${slug}.md`)));

      const getMock = getAPIMock()
        .get(`/api/v1/docs/${doc.data.slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIMock()
        .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug: doc.data.slug, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(docs.run({ folder: `./__tests__/${fixturesBaseDir}/slug-docs`, key, version })).resolves.toBe(
        `🌱 successfully created 'marc-actually-wrote-a-test' with contents from __tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });
  });
});
