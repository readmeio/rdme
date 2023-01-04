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

describe('rdme docs (single)', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  it('should prompt for login if no API key provided', async () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    prompts.inject(['this-is-not-an-email', 'password', 'subdomain']);
    await expect(docs.run({})).rejects.toStrictEqual(new Error('You must provide a valid email address.'));
    consoleInfoSpy.mockRestore();
  });

  it('should error in CI if no API key provided', async () => {
    process.env.TEST_RDME_CI = 'true';
    await expect(docs.run({})).rejects.toStrictEqual(new Error('No project API key provided. Please use `--key`.'));
    delete process.env.TEST_RDME_CI;
  });

  it('should error if no file path provided', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docs.run({ key, version })).rejects.toStrictEqual(
      new Error('No path provided. Usage `rdme docs <path> [options]`.')
    );

    versionMock.done();
  });

  it('should error if the argument is not a Markdown file', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docs.run({ key, version, filePath: 'not-a-markdown-file' })).rejects.toStrictEqual(
      new Error("Oops! We couldn't locate a file or directory at the path you provided.")
    );

    versionMock.done();
  });

  it('should support .markdown files but error if file path cannot be found', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });
    await expect(docs.run({ key, version, filePath: 'non-existent-file.markdown' })).rejects.toStrictEqual(
      new Error("Oops! We couldn't locate a file or directory at the path you provided.")
    );
    versionMock.done();
  });

  describe('new docs', () => {
    it('should create new doc', async () => {
      const slug = 'new-doc';
      const id = '1234';
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
        .reply(201, { slug, _id: id, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        docs.run({ filePath: `./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`, key, version })
      ).resolves.toBe(
        `🌱 successfully created 'new-doc' (ID: 1234) with contents from ./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`
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
        docs.run({ dryRun: true, filePath: `./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`, key, version })
      ).resolves.toBe(
        `🎭 dry run! This will create 'new-doc' with contents from ./__tests__/${fixturesBaseDir}/new-docs/new-doc.md with the following metadata: ${JSON.stringify(
          doc.data
        )}`
      );

      getMock.done();
      versionMock.done();
    });

    it('should skip doc if it does not contain any frontmatter attributes', async () => {
      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      const filePath = `./__tests__/${fixturesBaseDir}/failure-docs/doc-sans-attributes.md`;

      await expect(docs.run({ filePath, key, version })).resolves.toBe(
        `⏭️  no frontmatter attributes found for ${filePath}, skipping`
      );

      versionMock.done();
    });

    it('should fail if some other error when retrieving page slug', async () => {
      const slug = 'new-doc';

      const errorObject = {
        error: 'INTERNAL_ERROR',
        message: 'Unknown error (yikes)',
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      };

      const getMock = getAPIMockWithVersionHeader(version)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(500, errorObject);

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      const filePath = `./__tests__/${fixturesBaseDir}/failure-docs/${slug}.md`;

      const formattedErrorObject = {
        ...errorObject,
        message: `Error uploading ${chalk.underline(`${filePath}`)}:\n\n${errorObject.message}`,
      };

      await expect(docs.run({ filePath, key, version })).rejects.toStrictEqual(new APIError(formattedErrorObject));

      getMock.done();
      versionMock.done();
    });
  });

  describe('slug metadata', () => {
    it('should use provided slug', async () => {
      const slug = 'new-doc-slug';
      const id = '1234';
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
        .reply(201, { slug: doc.data.slug, _id: id, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        docs.run({ filePath: `./__tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`, key, version })
      ).resolves.toBe(
        `🌱 successfully created 'marc-actually-wrote-a-test' (ID: 1234) with contents from ./__tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });
  });

  describe('existing docs', () => {
    let simpleDoc;

    beforeEach(() => {
      const fileContents = fs.readFileSync(path.join(fullFixturesDir, '/existing-docs/simple-doc.md'));
      simpleDoc = {
        slug: 'simple-doc',
        doc: frontMatter(fileContents),
        hash: hashFileContents(fileContents),
      };
    });

    it('should fetch doc and merge with what is returned', () => {
      const getMock = getAPIMockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' });

      const updateMock = getAPIMockWithVersionHeader(version)
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
        });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs
        .run({ filePath: `./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, key, version })
        .then(updatedDocs => {
          expect(updatedDocs).toBe(
            `✏️ successfully updated 'simple-doc' with contents from ./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`
          );

          getMock.done();
          updateMock.done();
          versionMock.done();
        });
    });

    it('should return doc update info for dry run', () => {
      expect.assertions(1);

      const getMock = getAPIMockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs
        .run({ dryRun: true, filePath: `./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, key, version })
        .then(updatedDocs => {
          // All docs should have been updated because their hashes from the GET request were different from what they
          // are currently.
          expect(updatedDocs).toBe(
            [
              `🎭 dry run! This will update 'simple-doc' with contents from ./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md with the following metadata: ${JSON.stringify(
                simpleDoc.doc.data
              )}`,
            ].join('\n')
          );

          getMock.done();
          versionMock.done();
        });
    });

    it('should not send requests for docs that have not changed', () => {
      expect.assertions(1);

      const getMock = getAPIMockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs
        .run({ filePath: `./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, key, version })
        .then(skippedDocs => {
          expect(skippedDocs).toBe('`simple-doc` was not updated because there were no changes.');

          getMock.done();
          versionMock.done();
        });
    });

    it('should adjust "no changes" message if in dry run', () => {
      const getMock = getAPIMockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash });

      const versionMock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs
        .run({ dryRun: true, filePath: `./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, key, version })
        .then(skippedDocs => {
          expect(skippedDocs).toBe('🎭 dry run! `simple-doc` will not be updated because there were no changes.');

          getMock.done();
          versionMock.done();
        });
    });
  });
});
