import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import frontMatter from 'gray-matter';
import nock from 'nock';

import SingleChangelogCommand from '../../../src/cmds/changelogs/single';
import APIError from '../../../src/lib/apiError';
import getAPIMock from '../../helpers/get-api-mock';
import hashFileContents from '../../helpers/hash-file-contents';

const changelogsSingle = new SingleChangelogCommand();

const fixturesBaseDir = '__fixtures__/changelogs';
const fullFixturesDir = `${__dirname}./../../${fixturesBaseDir}`;
const key = 'API_KEY';

describe('rdme changelogs:single', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(changelogsSingle.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.')
    );
  });

  it('should error if no file path provided', () => {
    return expect(changelogsSingle.run({ key })).rejects.toThrow(
      'No file path provided. Usage `rdme changelogs:single <file> [options]`.'
    );
  });

  it('should error if the argument is not a Markdown file', async () => {
    await expect(changelogsSingle.run({ key, filePath: 'not-a-markdown-file' })).rejects.toThrow(
      'The file path specified is not a Markdown file.'
    );
  });

  it('should support .markdown files but error if file path cannot be found', async () => {
    await expect(changelogsSingle.run({ key, filePath: 'non-existent-file.markdown' })).rejects.toThrow(
      'ENOENT: no such file or directory'
    );
  });

  describe('new changelogs', () => {
    it('should create new changelog', async () => {
      const slug = 'new-doc';
      const id = '1234';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getAPIMock()
        .get(`/api/v1/changelogs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CHANGELOG_NOTFOUND',
          message: `The changelog with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIMock()
        .post('/api/v1/changelogs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug, id, body: doc.content, ...doc.data });

      await expect(
        changelogsSingle.run({ filePath: `./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`, key })
      ).resolves.toBe(
        `🌱 successfully created 'new-doc' with contents from ./__tests__/${fixturesBaseDir}/new-docs/new-doc.md with an id of 1234`
      );

      getMock.done();
      postMock.done();
    });

    it('should return creation info for dry run', async () => {
      const slug = 'new-doc';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getAPIMock()
        .get(`/api/v1/changelogs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CHANGELOG_NOTFOUND',
          message: `The changelog with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      await expect(
        changelogsSingle.run({ dryRun: true, filePath: `./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`, key })
      ).resolves.toBe(
        `🎭 dry run! This will create 'new-doc' with contents from ./__tests__/${fixturesBaseDir}/new-docs/new-doc.md with the following metadata: ${JSON.stringify(
          doc.data
        )}`
      );

      getMock.done();
    });

    it('should fail if the changelog is invalid', async () => {
      const folder = 'failure-docs';
      const slug = 'fail-doc';

      const errorObject = {
        error: 'CHANGELOG_INVALID',
        message: "We couldn't save this changelog (Changelog title cannot be blank).",
        suggestion: 'Make sure all the data is correct, and the body is valid Markdown.',
        docs: 'fake-metrics-uuid',
        help: "If you need help, email support@readme.io and include the following link to your API log: 'fake-metrics-uuid'.",
      };

      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slug}.md`)));

      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slug}.md`)));

      const getMock = getAPIMock()
        .get(`/api/v1/changelogs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CHANGELOG_NOTFOUND',
          message: `The changelog with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIMock()
        .post('/api/v1/changelogs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(400, errorObject);

      const filePath = `./__tests__/${fixturesBaseDir}/failure-docs/fail-doc.md`;

      const formattedErrorObject = {
        ...errorObject,
        message: `Error uploading ${chalk.underline(`${filePath}`)}:\n\n${errorObject.message}`,
      };

      await expect(changelogsSingle.run({ filePath: `${filePath}`, key })).rejects.toStrictEqual(
        new APIError(formattedErrorObject)
      );

      getMock.done();
      postMock.done();
    });

    it('should fail if some other error when retrieving page slug', async () => {
      const slug = 'fail-doc';

      const errorObject = {
        error: 'INTERNAL_ERROR',
        message: 'Unknown error (yikes)',
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      };

      const getMock = getAPIMock().get(`/api/v1/changelogs/${slug}`).basicAuth({ user: key }).reply(500, errorObject);

      const filePath = `./__tests__/${fixturesBaseDir}/failure-docs/fail-doc.md`;

      const formattedErrorObject = {
        ...errorObject,
        message: `Error uploading ${chalk.underline(`${filePath}`)}:\n\n${errorObject.message}`,
      };

      await expect(changelogsSingle.run({ filePath: `${filePath}`, key })).rejects.toStrictEqual(
        new APIError(formattedErrorObject)
      );

      getMock.done();
    });
  });

  describe('slug metadata', () => {
    it('should use provided slug', async () => {
      const slug = 'new-doc-slug';
      const id = '1234';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/slug-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/slug-docs/${slug}.md`)));

      const getMock = getAPIMock()
        .get(`/api/v1/changelogs/${doc.data.slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CHANGELOG_NOTFOUND',
          message: `The changelog with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIMock()
        .post('/api/v1/changelogs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug: doc.data.slug, id, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      await expect(
        changelogsSingle.run({ filePath: `./__tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`, key })
      ).resolves.toBe(
        `🌱 successfully created 'marc-actually-wrote-a-test' with contents from ./__tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md with an id of 1234`
      );

      getMock.done();
      postMock.done();
    });
  });

  describe('existing changelogs', () => {
    let simpleDoc;

    beforeEach(() => {
      const fileContents = fs.readFileSync(path.join(fullFixturesDir, '/existing-docs/simple-doc.md'));
      simpleDoc = {
        slug: 'simple-doc',
        doc: frontMatter(fileContents),
        hash: hashFileContents(fileContents),
      };
    });

    it('should fetch changelog and merge with what is returned', () => {
      const getMock = getAPIMock()
        .get('/api/v1/changelogs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' });

      const updateMock = getAPIMock()
        .put('/api/v1/changelogs/simple-doc', {
          slug: simpleDoc.slug,
          body: simpleDoc.doc.content,
          lastUpdatedHash: simpleDoc.hash,
          ...simpleDoc.doc.data,
        })
        .basicAuth({ user: key })
        .reply(200, {
          slug: simpleDoc.slug,
          body: simpleDoc.doc.content,
        });

      return changelogsSingle
        .run({ filePath: `./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, key })
        .then(updatedDocs => {
          expect(updatedDocs).toBe(
            `✏️ successfully updated 'simple-doc' with contents from ./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`
          );

          getMock.done();
          updateMock.done();
        });
    });

    it('should return changelog update info for dry run', () => {
      expect.assertions(1);

      const getMock = getAPIMock()
        .get('/api/v1/changelogs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' });

      return changelogsSingle
        .run({ dryRun: true, filePath: `./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, key })
        .then(updatedDocs => {
          // All changelogs should have been updated because their hashes from the GET request were different from what they
          // are currently.
          expect(updatedDocs).toBe(
            [
              `🎭 dry run! This will update 'simple-doc' with contents from ./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md with the following metadata: ${JSON.stringify(
                simpleDoc.doc.data
              )}`,
            ].join('\n')
          );

          getMock.done();
        });
    });

    it('should not send requests for changelogs that have not changed', () => {
      expect.assertions(1);

      const getMock = getAPIMock()
        .get('/api/v1/changelogs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash });

      return changelogsSingle
        .run({ filePath: `./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, key })
        .then(skippedDocs => {
          expect(skippedDocs).toBe('`simple-doc` was not updated because there were no changes.');

          getMock.done();
        });
    });

    it('should adjust "no changes" message if in dry run', () => {
      const getMock = getAPIMock()
        .get('/api/v1/changelogs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash });

      return changelogsSingle
        .run({ dryRun: true, filePath: `./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, key })
        .then(skippedDocs => {
          expect(skippedDocs).toBe('🎭 dry run! `simple-doc` will not be updated because there were no changes.');

          getMock.done();
        });
    });
  });
});
