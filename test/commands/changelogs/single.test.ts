import type { PageObject } from '../../helpers/page.types.js';

import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import grayMatter from 'gray-matter';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import Command from '../../../src/commands/changelogs.js';
import { APIv1Error } from '../../../src/lib/apiError.js';
import { getAPIv1Mock } from '../../helpers/get-api-mock.js';
import hashFileContents from '../../helpers/hash-file-contents.js';
import { runCommandAndReturnResult } from '../../helpers/oclif.js';

const fixturesBaseDir = '__fixtures__/changelogs';
const fullFixturesDir = `${__dirname}./../../${fixturesBaseDir}`;
const key = 'API_KEY';

describe('rdme changelogs (single)', () => {
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    run = runCommandAndReturnResult(Command);
  });

  it('should error if no file path provided', () => {
    return expect(run(['--key', key])).rejects.toThrow('Missing 1 required arg:\npath');
  });

  it('should error if the argument is not a Markdown file', () => {
    return expect(run(['--key', key, 'package.json'])).rejects.toStrictEqual(
      new Error('Invalid file extension (.json). Must be one of the following: .markdown, .md'),
    );
  });

  it('should support .markdown files but error if file path cannot be found', () => {
    return expect(run(['--key', key, 'non-existent-file.markdown'])).rejects.toStrictEqual(
      new Error("Oops! We couldn't locate a file or directory at the path you provided."),
    );
  });

  describe('new changelogs', () => {
    it('should create new changelog', async () => {
      const slug = 'new-doc';
      const id = '1234';
      const doc = grayMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getAPIv1Mock()
        .get(`/api/v1/changelogs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CHANGELOG_NOTFOUND',
          message: `The changelog with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIv1Mock()
        .post('/api/v1/changelogs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug, _id: id, body: doc.content, ...doc.data });

      await expect(run([`./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`, '--key', key])).resolves.toBe(
        `🌱 successfully created 'new-doc' (ID: 1234) with contents from ./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`,
      );

      getMock.done();
      postMock.done();
    });

    it('should return creation info for dry run', async () => {
      const slug = 'new-doc';
      const doc = grayMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getAPIv1Mock()
        .get(`/api/v1/changelogs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CHANGELOG_NOTFOUND',
          message: `The changelog with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      await expect(run(['--dryRun', `./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`, '--key', key])).resolves.toBe(
        `🎭 dry run! This will create 'new-doc' with contents from ./__tests__/${fixturesBaseDir}/new-docs/new-doc.md with the following metadata: ${JSON.stringify(
          doc.data,
        )}`,
      );

      getMock.done();
    });

    it('should skip if it does not contain any frontmatter attributes', async () => {
      const filePath = `./__tests__/${fixturesBaseDir}/failure-docs/doc-sans-attributes.md`;

      await expect(run([filePath, '--key', key])).resolves.toBe(
        `⏭️  no frontmatter attributes found for ${filePath}, skipping`,
      );
    });

    it('should fail if some other error when retrieving page slug', async () => {
      const slug = 'new-doc';

      const errorObject = {
        error: 'INTERNAL_ERROR',
        message: 'Unknown error (yikes)',
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      };

      const getMock = getAPIv1Mock().get(`/api/v1/changelogs/${slug}`).basicAuth({ user: key }).reply(500, errorObject);

      const filePath = `./__tests__/${fixturesBaseDir}/failure-docs/${slug}.md`;

      const formattedErrorObject = {
        ...errorObject,
        message: `Error uploading ${chalk.underline(`${filePath}`)}:\n\n${errorObject.message}`,
      };

      await expect(run([filePath, '--key', key])).rejects.toStrictEqual(new APIv1Error(formattedErrorObject));

      getMock.done();
    });
  });

  describe('slug metadata', () => {
    it('should use provided slug', async () => {
      const slug = 'new-doc-slug';
      const id = '1234';
      const doc = grayMatter(fs.readFileSync(path.join(fullFixturesDir, `/slug-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/slug-docs/${slug}.md`)));

      const getMock = getAPIv1Mock()
        .get(`/api/v1/changelogs/${doc.data.slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'CHANGELOG_NOTFOUND',
          message: `The changelog with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIv1Mock()
        .post('/api/v1/changelogs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug: doc.data.slug, _id: id, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      await expect(run([`./__tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`, '--key', key])).resolves.toBe(
        `🌱 successfully created 'marc-actually-wrote-a-test' (ID: 1234) with contents from ./__tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`,
      );

      getMock.done();
      postMock.done();
    });
  });

  describe('existing changelogs', () => {
    let simpleDoc: PageObject;

    beforeEach(() => {
      const fileContents = fs.readFileSync(path.join(fullFixturesDir, '/existing-docs/simple-doc.md'));
      simpleDoc = {
        slug: 'simple-doc',
        doc: grayMatter(fileContents),
        hash: hashFileContents(fileContents),
      };
    });

    it('should fetch changelog and merge with what is returned', () => {
      const getMock = getAPIv1Mock()
        .get('/api/v1/changelogs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' });

      const updateMock = getAPIv1Mock()
        .put('/api/v1/changelogs/simple-doc', {
          body: simpleDoc.doc.content,
          lastUpdatedHash: simpleDoc.hash,
          ...simpleDoc.doc.data,
        })
        .basicAuth({ user: key })
        .reply(200, {
          slug: simpleDoc.slug,
          body: simpleDoc.doc.content,
        });

      return run([`./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, '--key', key]).then(updatedDocs => {
        expect(updatedDocs).toBe(
          `✏️ successfully updated 'simple-doc' with contents from ./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`,
        );

        getMock.done();
        updateMock.done();
      });
    });

    it('should return changelog update info for dry run', () => {
      expect.assertions(1);

      const getMock = getAPIv1Mock()
        .get('/api/v1/changelogs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' });

      return run(['--dryRun', `./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, '--key', key]).then(
        updatedDocs => {
          // All changelogs should have been updated because their hashes from the GET request were different from what they
          // are currently.
          expect(updatedDocs).toBe(
            [
              `🎭 dry run! This will update 'simple-doc' with contents from ./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md with the following metadata: ${JSON.stringify(
                simpleDoc.doc.data,
              )}`,
            ].join('\n'),
          );

          getMock.done();
        },
      );
    });

    it('should not send requests for changelogs that have not changed', () => {
      expect.assertions(1);

      const getMock = getAPIv1Mock()
        .get('/api/v1/changelogs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash });

      return run([`./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, '--key', key]).then(skippedDocs => {
        expect(skippedDocs).toBe('`simple-doc` was not updated because there were no changes.');

        getMock.done();
      });
    });

    it('should adjust "no changes" message if in dry run', () => {
      const getMock = getAPIv1Mock()
        .get('/api/v1/changelogs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash });

      return run(['--dryRun', `./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, '--key', key]).then(
        skippedDocs => {
          expect(skippedDocs).toBe('🎭 dry run! `simple-doc` will not be updated because there were no changes.');

          getMock.done();
        },
      );
    });
  });
});
