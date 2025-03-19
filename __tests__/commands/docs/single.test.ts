import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import frontMatter from 'gray-matter';
import nock from 'nock';
import { describe, beforeAll, afterAll, beforeEach, afterEach, it, expect } from 'vitest';

import Command from '../../../src/commands/docs/index.js';
import { APIv1Error } from '../../../src/lib/apiError.js';
import { getAPIv1Mock, getAPIv1MockWithVersionHeader } from '../../helpers/get-api-mock.js';
import hashFileContents from '../../helpers/hash-file-contents.js';
import { runCommandAndReturnResult } from '../../helpers/oclif.js';
import { after as afterGHAEnv, before as beforeGHAEnv } from '../../helpers/setup-gha-env.js';

const fixturesBaseDir = '__fixtures__/docs';
const fullFixturesDir = `${__dirname}./../../${fixturesBaseDir}`;

const key = 'API_KEY';
const version = '1.0.0';
const category = 'CATEGORY_ID';

describe('rdme docs (single)', () => {
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    nock.disableNetConnect();
    run = runCommandAndReturnResult(Command);
  });

  afterAll(() => nock.cleanAll());

  it('should error if no file path provided', () => {
    return expect(run(['--key', key, '--version', version])).rejects.toThrow('Missing 1 required arg:\npath');
  });

  it('should error if the argument is not a Markdown file', async () => {
    const versionMock = getAPIv1Mock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    await expect(run(['--key', key, '--version', version, 'not-a-markdown-file'])).rejects.toStrictEqual(
      new Error("Oops! We couldn't locate a file or directory at the path you provided."),
    );

    versionMock.done();
  });

  it('should support .markdown files but error if file path cannot be found', async () => {
    const versionMock = getAPIv1Mock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });
    await expect(run(['--key', key, '--version', version, 'non-existent-file.markdown'])).rejects.toStrictEqual(
      new Error("Oops! We couldn't locate a file or directory at the path you provided."),
    );
    versionMock.done();
  });

  describe('new docs', () => {
    it('should create new doc', async () => {
      const slug = 'new-doc';
      const id = '1234';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getAPIv1MockWithVersionHeader(version)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIv1MockWithVersionHeader(version)
        .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug, _id: id, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        run([`./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`, '--key', key, '--version', version]),
      ).resolves.toBe(
        `🌱 successfully created 'new-doc' (ID: 1234) with contents from ./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`,
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });

    it('should return creation info for dry run', async () => {
      const slug = 'new-doc';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getAPIv1MockWithVersionHeader(version)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        run(['--dryRun', `./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`, '--key', key, '--version', version]),
      ).resolves.toBe(
        `🎭 dry run! This will create 'new-doc' with contents from ./__tests__/${fixturesBaseDir}/new-docs/new-doc.md with the following metadata: ${JSON.stringify(
          doc.data,
        )}`,
      );

      getMock.done();
      versionMock.done();
    });

    it('should skip doc if it does not contain any frontmatter attributes', async () => {
      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      const filePath = `./__tests__/${fixturesBaseDir}/failure-docs/doc-sans-attributes.md`;

      await expect(run(['--key', key, '--version', version, filePath])).resolves.toBe(
        `⏭️  no frontmatter attributes found for ${filePath}, skipping`,
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

      const getMock = getAPIv1MockWithVersionHeader(version)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(500, errorObject);

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      const filePath = `./__tests__/${fixturesBaseDir}/failure-docs/${slug}.md`;

      const formattedErrorObject = {
        ...errorObject,
        message: `Error uploading ${chalk.underline(`${filePath}`)}:\n\n${errorObject.message}`,
      };

      await expect(run([filePath, '--key', key, '--version', version])).rejects.toStrictEqual(
        new APIv1Error(formattedErrorObject),
      );

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

      const getMock = getAPIv1Mock()
        .get(`/api/v1/docs/${doc.data.slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIv1Mock()
        .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug: doc.data.slug, _id: id, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        run([`./__tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`, '--key', key, '--version', version]),
      ).resolves.toBe(
        `🌱 successfully created 'marc-actually-wrote-a-test' (ID: 1234) with contents from ./__tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`,
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

    it('should fetch doc and merge with what is returned', async () => {
      const getMock = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' });

      const updateMock = getAPIv1MockWithVersionHeader(version)
        .put('/api/v1/docs/simple-doc', {
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

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        run([`./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, '--key', key, '--version', version]),
      ).resolves.toBe(
        `✏️ successfully updated 'simple-doc' with contents from ./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`,
      );

      getMock.done();
      updateMock.done();
      versionMock.done();
    });

    it('should return doc update info for dry run', async () => {
      const getMock = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        run([
          '--dryRun',
          `./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`,
          '--key',
          key,
          '--version',
          version,
        ]),
      ).resolves.toBe(
        [
          `🎭 dry run! This will update 'simple-doc' with contents from ./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md with the following metadata: ${JSON.stringify(
            simpleDoc.doc.data,
          )}`,
        ].join('\n'),
      );

      getMock.done();
      versionMock.done();
    });

    it('should not send requests for docs that have not changed', async () => {
      const getMock = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        run([`./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, '--key', key, '--version', version]),
      ).resolves.toBe('`simple-doc` was not updated because there were no changes.');

      getMock.done();
      versionMock.done();
    });

    it('should adjust "no changes" message if in dry run', async () => {
      const getMock = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        run([
          '--dryRun',
          `./__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`,
          '--key',
          key,
          '--version',
          version,
        ]),
      ).resolves.toBe('🎭 dry run! `simple-doc` will not be updated because there were no changes.');

      getMock.done();
      versionMock.done();
    });
  });

  describe('command execution in GitHub Actions runner', () => {
    beforeEach(() => {
      beforeGHAEnv();
    });

    afterEach(afterGHAEnv);

    it('should sync new doc with correct headers', async () => {
      const slug = 'new-doc';
      const id = '1234';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getAPIv1MockWithVersionHeader(version)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIv1Mock({
        'x-rdme-ci': 'GitHub Actions (test)',
        'x-readme-source': 'cli-gh',
        'x-readme-source-url':
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/docs/new-docs/new-doc.md',
        'x-readme-version': version,
      })
        .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug, _id: id, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        run([`./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`, '--key', key, '--version', version]),
      ).resolves.toBe(
        `🌱 successfully created 'new-doc' (ID: 1234) with contents from ./__tests__/${fixturesBaseDir}/new-docs/new-doc.md`,
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });

    it('should sync existing doc with correct headers', async () => {
      const fileContents = fs.readFileSync(path.join(fullFixturesDir, '/existing-docs/simple-doc.md'));
      const simpleDoc = {
        slug: 'simple-doc',
        doc: frontMatter(fileContents),
        hash: hashFileContents(fileContents),
      };

      const getMock = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' });

      const updateMock = getAPIv1Mock({
        'x-rdme-ci': 'GitHub Actions (test)',
        'x-readme-source': 'cli-gh',
        'x-readme-source-url':
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/docs/existing-docs/simple-doc.md',
        'x-readme-version': version,
      })
        .put('/api/v1/docs/simple-doc', {
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

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(
        run([`__tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`, '--key', key, '--version', version]),
      ).resolves.toBe(
        `✏️ successfully updated 'simple-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`,
      );

      getMock.done();
      updateMock.done();
      versionMock.done();
    });
  });
});
