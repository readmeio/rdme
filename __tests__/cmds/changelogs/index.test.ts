import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import frontMatter from 'gray-matter';
import nock from 'nock';

import ChangelogsCommand from '../../../src/cmds/changelogs';
import APIError from '../../../src/lib/apiError';
import getAPIMock from '../../helpers/get-api-mock';
import hashFileContents from '../../helpers/hash-file-contents';

const changelogs = new ChangelogsCommand();

const fixturesBaseDir = '__fixtures__/changelogs';
const fullFixturesDir = `${__dirname}./../../${fixturesBaseDir}`;
const key = 'API_KEY';

describe('rdme changelogs', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(changelogs.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.')
    );
  });

  it('should error if no folder provided', () => {
    return expect(changelogs.run({ key })).rejects.toThrow(
      'No folder provided. Usage `rdme changelogs <folder> [options]`.'
    );
  });

  it('should error if the argument is not a folder', () => {
    return expect(changelogs.run({ key, folder: 'not-a-folder' })).rejects.toThrow(
      "ENOENT: no such file or directory, scandir 'not-a-folder'"
    );
  });

  it('should error if the folder contains no markdown files', () => {
    return expect(changelogs.run({ key, folder: '.github/workflows' })).rejects.toThrow(
      'We were unable to locate Markdown files in .github/workflows.'
    );
  });

  describe('existing changelogs', () => {
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

    it('should fetch changelog and merge with what is returned', () => {
      expect.assertions(1);

      const getMocks = getAPIMock()
        .get('/api/v1/changelogs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' })
        .get('/api/v1/changelogs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: anotherDoc.slug, lastUpdatedHash: 'anOldHash' });

      const updateMocks = getAPIMock()
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
        })
        .put('/api/v1/changelogs/another-doc', {
          slug: anotherDoc.slug,
          body: anotherDoc.doc.content,
          lastUpdatedHash: anotherDoc.hash,
          ...anotherDoc.doc.data,
        })
        .basicAuth({ user: key })
        .reply(200, { slug: anotherDoc.slug, body: anotherDoc.doc.content });

      return changelogs.run({ folder: `./__tests__/${fixturesBaseDir}/existing-docs`, key }).then(updatedDocs => {
        // All changelogs should have been updated because their hashes from the GET request were different from what they
        // are currently.
        expect(updatedDocs).toBe(
          [
            `✏️ successfully updated 'simple-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`,
            `✏️ successfully updated 'another-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/subdir/another-doc.md`,
          ].join('\n')
        );

        getMocks.done();
        updateMocks.done();
      });
    });

    it('should return changelog update info for dry run', () => {
      expect.assertions(1);

      const getMocks = getAPIMock()
        .get('/api/v1/changelogs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' })
        .get('/api/v1/changelogs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: anotherDoc.slug, lastUpdatedHash: 'anOldHash' });

      return changelogs
        .run({ dryRun: true, folder: `./__tests__/${fixturesBaseDir}/existing-docs`, key })
        .then(updatedDocs => {
          // All changelogs should have been updated because their hashes from the GET request were different from what they
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
        });
    });

    it('should not send requests for changelogs that have not changed', () => {
      expect.assertions(1);

      const getMocks = getAPIMock()
        .get('/api/v1/changelogs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash })
        .get('/api/v1/changelogs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: anotherDoc.slug, lastUpdatedHash: anotherDoc.hash });

      return changelogs.run({ folder: `./__tests__/${fixturesBaseDir}/existing-docs`, key }).then(skippedDocs => {
        expect(skippedDocs).toBe(
          [
            '`simple-doc` was not updated because there were no changes.',
            '`another-doc` was not updated because there were no changes.',
          ].join('\n')
        );

        getMocks.done();
      });
    });

    it('should adjust "no changes" message if in dry run', () => {
      expect.assertions(1);

      const getMocks = getAPIMock()
        .get('/api/v1/changelogs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash })
        .get('/api/v1/changelogs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: anotherDoc.slug, lastUpdatedHash: anotherDoc.hash });

      return changelogs
        .run({ dryRun: true, folder: `./__tests__/${fixturesBaseDir}/existing-docs`, key })
        .then(skippedDocs => {
          expect(skippedDocs).toBe(
            [
              '🎭 dry run! `simple-doc` will not be updated because there were no changes.',
              '🎭 dry run! `another-doc` will not be updated because there were no changes.',
            ].join('\n')
          );

          getMocks.done();
        });
    });
  });

  describe('new changelogs', () => {
    it('should create new changelog', async () => {
      const slug = 'new-doc';
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
        .reply(201, { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      await expect(changelogs.run({ folder: `./__tests__/${fixturesBaseDir}/new-docs`, key })).resolves.toBe(
        `🌱 successfully created 'new-doc' with contents from __tests__/${fixturesBaseDir}/new-docs/new-doc.md`
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
        changelogs.run({ dryRun: true, folder: `./__tests__/${fixturesBaseDir}/new-docs`, key })
      ).resolves.toBe(
        `🎭 dry run! This will create 'new-doc' with contents from __tests__/${fixturesBaseDir}/new-docs/new-doc.md with the following metadata: ${JSON.stringify(
          doc.data
        )}`
      );

      getMock.done();
    });

    it('should fail if any changelogs are invalid', async () => {
      const folder = 'failure-docs';
      const slug = 'fail-doc';
      const slugTwo = 'new-doc';

      const errorObject = {
        error: 'CHANGELOG_INVALID',
        message: "We couldn't save this changelog (Changelog title cannot be blank).",
        suggestion: 'Make sure all the data is correct, and the body is valid Markdown.',
        docs: 'fake-metrics-uuid',
        help: "If you need help, email support@readme.io and include the following link to your API log: 'fake-metrics-uuid'.",
      };
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slug}.md`)));
      const docTwo = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slugTwo}.md`)));

      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slug}.md`)));
      const hashTwo = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slugTwo}.md`)));

      const getMocks = getAPIMock()
        .get(`/api/v1/changelogs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CHANGELOG_NOTFOUND',
          message: `The changelog with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        })
        .get(`/api/v1/changelogs/${slugTwo}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CHANGELOG_NOTFOUND',
          message: `The changelog with the slug '${slugTwo}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMocks = getAPIMock()
        .post('/api/v1/changelogs', { slug: slugTwo, body: docTwo.content, ...docTwo.data, lastUpdatedHash: hashTwo })
        .basicAuth({ user: key })
        .reply(201, {
          metadata: { image: [], title: '', description: '' },
          title: 'This is the changelog title',
          slug: slugTwo,
          body: 'Body',
        })
        .post('/api/v1/changelogs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(400, errorObject);

      const fullDirectory = `__tests__/${fixturesBaseDir}/${folder}`;

      const formattedErrorObject = {
        ...errorObject,
        message: `Error uploading ${chalk.underline(`${fullDirectory}/${slug}.md`)}:\n\n${errorObject.message}`,
      };

      await expect(changelogs.run({ folder: `./${fullDirectory}`, key })).rejects.toStrictEqual(
        new APIError(formattedErrorObject)
      );

      getMocks.done();
      postMocks.done();
    });
  });

  describe('slug metadata', () => {
    it('should use provided slug', async () => {
      const slug = 'new-doc-slug';
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
        .reply(201, { slug: doc.data.slug, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      await expect(changelogs.run({ folder: `./__tests__/${fixturesBaseDir}/slug-docs`, key })).resolves.toBe(
        `🌱 successfully created 'marc-actually-wrote-a-test' with contents from __tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`
      );

      getMock.done();
      postMock.done();
    });
  });
});
