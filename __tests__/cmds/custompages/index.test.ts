import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import frontMatter from 'gray-matter';
import nock from 'nock';

import CustomPagesCommand from '../../../src/cmds/custompages';
import APIError from '../../../src/lib/apiError';
import getAPIMock from '../../helpers/get-api-mock';
import hashFileContents from '../../helpers/hash-file-contents';

const custompages = new CustomPagesCommand();

const fixturesBaseDir = '__fixtures__/custompages';
const fullFixturesDir = `${__dirname}./../../${fixturesBaseDir}`;
const key = 'API_KEY';

describe('rdme custompages', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(custompages.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.')
    );
  });

  it('should error if no folder provided', () => {
    return expect(custompages.run({ key })).rejects.toStrictEqual(
      new Error('No folder provided. Usage `rdme custompages <folder> [options]`.')
    );
  });

  it('should error if the argument is not a folder', () => {
    return expect(custompages.run({ key, version: '1.0.0', folder: 'not-a-folder' })).rejects.toThrow(
      "ENOENT: no such file or directory, scandir 'not-a-folder'"
    );
  });

  it('should error if the folder contains no markdown nor HTML files', () => {
    return expect(custompages.run({ key, folder: '.github/workflows' })).rejects.toStrictEqual(
      new Error('We were unable to locate Markdown or HTML files in .github/workflows.')
    );
  });

  describe('existing custompages', () => {
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

    it('should fetch custom page and merge with what is returned', () => {
      expect.assertions(1);

      const getMocks = getAPIMock()
        .get('/api/v1/custompages/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, htmlmode: false, lastUpdatedHash: 'anOldHash' })
        .get('/api/v1/custompages/another-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: anotherDoc.slug, htmlmode: false, lastUpdatedHash: 'anOldHash' });

      const updateMocks = getAPIMock()
        .put('/api/v1/custompages/simple-doc', {
          slug: simpleDoc.slug,
          body: simpleDoc.doc.content,
          htmlmode: false,
          lastUpdatedHash: simpleDoc.hash,
          ...simpleDoc.doc.data,
        })
        .basicAuth({ user: key })
        .reply(200, {
          slug: simpleDoc.slug,
          htmlmode: false,
          body: simpleDoc.doc.content,
        })
        .put('/api/v1/custompages/another-doc', {
          slug: anotherDoc.slug,
          body: anotherDoc.doc.content,
          htmlmode: false,
          lastUpdatedHash: anotherDoc.hash,
          ...anotherDoc.doc.data,
        })
        .basicAuth({ user: key })
        .reply(200, { slug: anotherDoc.slug, body: anotherDoc.doc.content, htmlmode: false });

      return custompages.run({ folder: `./__tests__/${fixturesBaseDir}/existing-docs`, key }).then(updatedDocs => {
        // All custompages should have been updated because their hashes from the GET request were different from what they
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

    it('should return custom page update info for dry run', () => {
      expect.assertions(1);

      const getMocks = getAPIMock()
        .get('/api/v1/custompages/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' })
        .get('/api/v1/custompages/another-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: anotherDoc.slug, lastUpdatedHash: 'anOldHash' });

      return custompages
        .run({ dryRun: true, folder: `./__tests__/${fixturesBaseDir}/existing-docs`, key })
        .then(updatedDocs => {
          // All custompages should have been updated because their hashes from the GET request were different from what they
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

    it('should not send requests for custompages that have not changed', () => {
      expect.assertions(1);

      const getMocks = getAPIMock()
        .get('/api/v1/custompages/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash })
        .get('/api/v1/custompages/another-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: anotherDoc.slug, lastUpdatedHash: anotherDoc.hash });

      return custompages.run({ folder: `./__tests__/${fixturesBaseDir}/existing-docs`, key }).then(skippedDocs => {
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
        .get('/api/v1/custompages/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash })
        .get('/api/v1/custompages/another-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: anotherDoc.slug, lastUpdatedHash: anotherDoc.hash });

      return custompages
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

  describe('new custompages', () => {
    it('should create new custom page', async () => {
      const slug = 'new-doc';
      const id = '1234';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getAPIMock()
        .get(`/api/v1/custompages/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CUSTOMPAGE_NOTFOUND',
          message: `The custom page with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIMock()
        .post('/api/v1/custompages', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug, id, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      await expect(custompages.run({ folder: `./__tests__/${fixturesBaseDir}/new-docs`, key })).resolves.toBe(
        `🌱 successfully created 'new-doc' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/new-docs/new-doc.md`
      );

      getMock.done();
      postMock.done();
    });

    it('should create new HTML custom page', async () => {
      const slug = 'new-doc';
      const id = '1234';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs-html/${slug}.html`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/new-docs-html/${slug}.html`)));

      const getMock = getAPIMock()
        .get(`/api/v1/custompages/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CUSTOMPAGE_NOTFOUND',
          message: `The custom page with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIMock()
        .post('/api/v1/custompages', { slug, html: doc.content, htmlmode: true, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug, id, html: doc.content, htmlmode: true, ...doc.data, lastUpdatedHash: hash });

      await expect(custompages.run({ folder: `./__tests__/${fixturesBaseDir}/new-docs-html`, key })).resolves.toBe(
        `🌱 successfully created 'new-doc' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/new-docs-html/new-doc.html`
      );

      getMock.done();
      postMock.done();
    });

    it('should return creation info for dry run', async () => {
      const slug = 'new-doc';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getAPIMock()
        .get(`/api/v1/custompages/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CUSTOMPAGE_NOTFOUND',
          message: `The custom page with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      await expect(
        custompages.run({ dryRun: true, folder: `./__tests__/${fixturesBaseDir}/new-docs`, key })
      ).resolves.toBe(
        `🎭 dry run! This will create 'new-doc' with contents from __tests__/${fixturesBaseDir}/new-docs/new-doc.md with the following metadata: ${JSON.stringify(
          doc.data
        )}`
      );

      getMock.done();
    });

    it('should fail if any custompages are invalid', async () => {
      const folder = 'failure-docs';
      const slug = 'fail-doc';
      const slugTwo = 'new-doc';

      const errorObject = {
        error: 'CUSTOMPAGE_INVALID',
        message: "We couldn't save this page (Custom page title cannot be blank).",
        suggestion: 'Make sure all the data is correct, and the body is valid Markdown or HTML.',
        docs: 'fake-metrics-uuid',
        help: "If you need help, email support@readme.io and include the following link to your API log: 'fake-metrics-uuid'.",
      };
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slug}.md`)));
      const docTwo = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slugTwo}.md`)));

      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slug}.md`)));
      const hashTwo = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slugTwo}.md`)));

      const getMocks = getAPIMock()
        .get(`/api/v1/custompages/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CUSTOMPAGE_NOTFOUND',
          message: `The custom page with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        })
        .get(`/api/v1/custompages/${slugTwo}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CUSTOMPAGE_NOTFOUND',
          message: `The custom page with the slug '${slugTwo}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMocks = getAPIMock()
        .post('/api/v1/custompages', {
          slug: slugTwo,
          body: docTwo.content,
          htmlmode: false,
          ...docTwo.data,
          lastUpdatedHash: hashTwo,
        })
        .basicAuth({ user: key })
        .reply(201, {
          metadata: { image: [], title: '', description: '' },
          title: 'This is the custom page title',
          slug: slugTwo,
          body: 'Body',
        })
        .post('/api/v1/custompages', { slug, body: doc.content, htmlmode: false, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(400, errorObject);

      const fullDirectory = `__tests__/${fixturesBaseDir}/${folder}`;

      const formattedErrorObject = {
        ...errorObject,
        message: `Error uploading ${chalk.underline(`${fullDirectory}/${slug}.md`)}:\n\n${errorObject.message}`,
      };

      await expect(custompages.run({ folder: `./${fullDirectory}`, key })).rejects.toStrictEqual(
        new APIError(formattedErrorObject)
      );

      getMocks.done();
      postMocks.done();
    });
  });

  describe('slug metadata', () => {
    it('should use provided slug', async () => {
      const slug = 'new-doc-slug';
      const id = '1234';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/slug-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/slug-docs/${slug}.md`)));

      const getMock = getAPIMock()
        .get(`/api/v1/custompages/${doc.data.slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CUSTOMPAGE_NOTFOUND',
          message: `The custom page with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIMock()
        .post('/api/v1/custompages', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug: doc.data.slug, id, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      await expect(custompages.run({ folder: `./__tests__/${fixturesBaseDir}/slug-docs`, key })).resolves.toBe(
        `🌱 successfully created 'marc-actually-wrote-a-test' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`
      );

      getMock.done();
      postMock.done();
    });
  });
});
