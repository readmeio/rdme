/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import frontMatter from 'gray-matter';
import nock from 'nock';
import prompts from 'prompts';
import { describe, beforeAll, afterAll, beforeEach, afterEach, it, expect, vi, type MockInstance } from 'vitest';

import Command from '../../../src/commands/docs/index.js';
import { APIv1Error } from '../../../src/lib/apiError.js';
import { getAPIv1Mock, getAPIv1MockWithVersionHeader } from '../../helpers/get-api-mock.js';
import { gitMock, githubActionsEnv } from '../../helpers/git-mock.js';
import hashFileContents from '../../helpers/hash-file-contents.js';
import { runCommandAndReturnResult, runCommandWithHooks } from '../../helpers/oclif.js';

const fixturesBaseDir = '__fixtures__/docs';
const fullFixturesDir = `${__dirname}./../../${fixturesBaseDir}`;

const key = 'API_KEY';
const version = '1.0.0';
const category = 'CATEGORY_ID';

describe('rdme docs', () => {
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    nock.disableNetConnect();
    run = runCommandAndReturnResult(Command);
  });

  afterAll(() => nock.cleanAll());

  it('should error if no path provided', () => {
    return expect(run(['--key', key, '--version', '1.0.0'])).rejects.toThrow('Missing 1 required arg:\npath');
  });

  it('should error if the argument is not a folder', async () => {
    const versionMock = getAPIv1Mock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    await expect(run(['--key', key, '--version', '1.0.0', 'not-a-folder'])).rejects.toStrictEqual(
      new Error("Oops! We couldn't locate a file or directory at the path you provided."),
    );

    versionMock.done();
  });

  it('should error if the folder contains no markdown files', async () => {
    const versionMock = getAPIv1Mock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    await expect(run(['--key', key, '--version', '1.0.0', '.github/workflows'])).rejects.toStrictEqual(
      new Error(
        "The directory you provided (.github/workflows) doesn't contain any of the following required files: .markdown, .md.",
      ),
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

      const getMocks = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: 'anOldHash' });

      const updateMocks = getAPIv1MockWithVersionHeader(version)
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
        })
        .put('/api/v1/docs/another-doc', {
          body: anotherDoc.doc.content,
          lastUpdatedHash: anotherDoc.hash,
          ...anotherDoc.doc.data,
        })
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, body: anotherDoc.doc.content });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return run([`./__tests__/${fixturesBaseDir}/existing-docs`, '--key', key, '--version', version]).then(
        updatedDocs => {
          // All docs should have been updated because their hashes from the GET request were different from what they
          // are currently.
          expect(updatedDocs).toBe(
            [
              `✏️ successfully updated 'simple-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`,
              `✏️ successfully updated 'another-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/subdir/another-doc.md`,
            ].join('\n'),
          );

          getMocks.done();
          updateMocks.done();
          versionMock.done();
        },
      );
    });

    it('should return doc update info for dry run', () => {
      expect.assertions(1);

      const getMocks = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: 'anOldHash' });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return run(['--dryRun', `./__tests__/${fixturesBaseDir}/existing-docs`, '--key', key, '--version', version]).then(
        updatedDocs => {
          // All docs should have been updated because their hashes from the GET request were different from what they
          // are currently.
          expect(updatedDocs).toBe(
            [
              `🎭 dry run! This will update 'simple-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/simple-doc.md with the following metadata: ${JSON.stringify(
                simpleDoc.doc.data,
              )}`,
              `🎭 dry run! This will update 'another-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/subdir/another-doc.md with the following metadata: ${JSON.stringify(
                anotherDoc.doc.data,
              )}`,
            ].join('\n'),
          );

          getMocks.done();
          versionMock.done();
        },
      );
    });

    it('should not send requests for docs that have not changed', () => {
      expect.assertions(1);

      const getMocks = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: anotherDoc.hash });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return run([`./__tests__/${fixturesBaseDir}/existing-docs`, '--key', key, '--version', version]).then(
        skippedDocs => {
          expect(skippedDocs).toBe(
            [
              '`simple-doc` was not updated because there were no changes.',
              '`another-doc` was not updated because there were no changes.',
            ].join('\n'),
          );

          getMocks.done();
          versionMock.done();
        },
      );
    });

    it('should adjust "no changes" message if in dry run', () => {
      expect.assertions(1);

      const getMocks = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: anotherDoc.hash });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return run(['--dryRun', `./__tests__/${fixturesBaseDir}/existing-docs`, '--key', key, '--version', version]).then(
        skippedDocs => {
          expect(skippedDocs).toBe(
            [
              '🎭 dry run! `simple-doc` will not be updated because there were no changes.',
              '🎭 dry run! `another-doc` will not be updated because there were no changes.',
            ].join('\n'),
          );

          getMocks.done();
          versionMock.done();
        },
      );
    });
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

      await expect(run([`./__tests__/${fixturesBaseDir}/new-docs`, '--key', key, '--version', version])).resolves.toBe(
        `🌱 successfully created 'new-doc' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/new-docs/new-doc.md`,
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
        run(['--dryRun', `./__tests__/${fixturesBaseDir}/new-docs`, '--key', key, '--version', version]),
      ).resolves.toBe(
        `🎭 dry run! This will create 'new-doc' with contents from __tests__/${fixturesBaseDir}/new-docs/new-doc.md with the following metadata: ${JSON.stringify(
          doc.data,
        )}`,
      );

      getMock.done();
      versionMock.done();
    });

    it('should fail if any docs are invalid', async () => {
      const folder = 'failure-docs';
      const slug = 'new-doc';

      const errorObject = {
        error: 'DOC_INVALID',
        message: "We couldn't save this doc (Path `category` is required.).",
      };

      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slug}.md`)));

      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/${folder}/${slug}.md`)));

      const getMocks = getAPIv1MockWithVersionHeader(version)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMocks = getAPIv1MockWithVersionHeader(version)
        .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(400, errorObject);

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      const fullDirectory = `__tests__/${fixturesBaseDir}/${folder}`;

      const formattedErrorObject = {
        ...errorObject,
        message: `Error uploading ${chalk.underline(`${fullDirectory}/${slug}.md`)}:\n\n${errorObject.message}`,
      };

      await expect(run([`./${fullDirectory}`, '--key', key, '--version', version])).rejects.toStrictEqual(
        new APIv1Error(formattedErrorObject),
      );

      getMocks.done();
      postMocks.done();
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

      await expect(run([`./__tests__/${fixturesBaseDir}/slug-docs`, '--key', key, '--version', version])).resolves.toBe(
        `🌱 successfully created 'marc-actually-wrote-a-test' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`,
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });
  });

  describe('GHA onboarding E2E tests', () => {
    let consoleInfoSpy: MockInstance;
    let yamlOutput;

    const getCommandOutput = () => {
      return [consoleInfoSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
    };

    beforeEach(() => {
      consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      gitMock.before((fileName, data) => {
        yamlOutput = data;
      });
    });

    afterEach(() => {
      gitMock.after();

      consoleInfoSpy.mockRestore();
    });

    it('should create GHA workflow with version passed in via prompt', async () => {
      expect.assertions(6);

      const altVersion = '1.0.1';
      const slug = 'new-doc';
      const id = '1234';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const versionsMock = getAPIv1Mock()
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [{ version }, { version: altVersion }]);

      const getMock = getAPIv1MockWithVersionHeader(altVersion)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIv1MockWithVersionHeader(altVersion)
        .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { _id: id, slug, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const fileName = 'docs-test-file';
      prompts.inject([altVersion, true, 'docs-test-branch', fileName]);

      await expect(run([`./__tests__/${fixturesBaseDir}/new-docs`, '--key', key])).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));
      expect(console.info).toHaveBeenCalledTimes(2);
      const output = getCommandOutput();
      expect(output).toMatch("Looks like you're running this command in a GitHub Repository!");
      expect(output).toMatch(`successfully created '${slug}' (ID: ${id}) with contents from`);

      versionsMock.done();
      getMock.done();
      postMock.done();
    });

    it('should create GHA workflow with version passed in via opt', async () => {
      expect.assertions(3);

      const slug = 'new-doc';
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
        .reply(201, { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      const fileName = 'docs-test-file';
      prompts.inject([true, 'docs-test-branch', fileName]);

      await expect(
        run([`./__tests__/${fixturesBaseDir}/new-docs`, '--key', key, '--version', version]),
      ).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));

      getMock.done();
      postMock.done();
      versionMock.done();
    });

    it('should create GHA workflow with version passed as opt (github flag enabled)', async () => {
      expect.assertions(3);

      const slug = 'new-doc';
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
        .reply(201, { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      const fileName = 'docs-test-file-github-flag';
      prompts.inject(['docs-test-branch-github-flag', fileName]);

      await expect(
        run([`./__tests__/${fixturesBaseDir}/new-docs`, '--github', '--key', key, '--version', version]),
      ).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));

      getMock.done();
      postMock.done();
      versionMock.done();
    });

    it('should reject if user says no to creating GHA workflow', async () => {
      const slug = 'new-doc';
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
        .reply(201, { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      prompts.inject([false]);

      await expect(
        run([`./__tests__/${fixturesBaseDir}/new-docs`, '--key', key, '--version', version]),
      ).rejects.toStrictEqual(
        new Error(
          'GitHub Actions workflow creation cancelled. If you ever change your mind, you can run this command again with the `--github` flag.',
        ),
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });
  });

  describe('command execution in GitHub Actions runner', () => {
    beforeEach(() => {
      githubActionsEnv.before();
    });

    afterEach(() => {
      githubActionsEnv.after();
    });

    it('should sync new docs directory with correct headers', async () => {
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

      await expect(run([`./__tests__/${fixturesBaseDir}/new-docs`, '--key', key, '--version', version])).resolves.toBe(
        `🌱 successfully created 'new-doc' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/new-docs/new-doc.md`,
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });

    it('should sync existing docs directory with correct headers', () => {
      let fileContents = fs.readFileSync(path.join(fullFixturesDir, '/existing-docs/simple-doc.md'));
      const simpleDoc = {
        slug: 'simple-doc',
        doc: frontMatter(fileContents),
        hash: hashFileContents(fileContents),
      };

      fileContents = fs.readFileSync(path.join(fullFixturesDir, '/existing-docs/subdir/another-doc.md'));
      const anotherDoc = {
        slug: 'another-doc',
        doc: frontMatter(fileContents),
        hash: hashFileContents(fileContents),
      };

      expect.assertions(1);

      const getMocks = getAPIv1MockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: 'anOldHash' });

      const firstUpdateMock = getAPIv1Mock({
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

      const secondUpdateMock = getAPIv1Mock({
        'x-rdme-ci': 'GitHub Actions (test)',
        'x-readme-source': 'cli-gh',
        'x-readme-source-url':
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/docs/existing-docs/subdir/another-doc.md',
        'x-readme-version': version,
      })
        .put('/api/v1/docs/another-doc', {
          body: anotherDoc.doc.content,
          lastUpdatedHash: anotherDoc.hash,
          ...anotherDoc.doc.data,
        })
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, body: anotherDoc.doc.content });

      const versionMock = getAPIv1Mock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return run([`__tests__/${fixturesBaseDir}/existing-docs`, '--key', key, '--version', version]).then(
        updatedDocs => {
          // All docs should have been updated because their hashes from the GET request were different from what they
          // are currently.
          expect(updatedDocs).toBe(
            [
              `✏️ successfully updated 'simple-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/simple-doc.md`,
              `✏️ successfully updated 'another-doc' with contents from __tests__/${fixturesBaseDir}/existing-docs/subdir/another-doc.md`,
            ].join('\n'),
          );

          getMocks.done();
          firstUpdateMock.done();
          secondUpdateMock.done();
          versionMock.done();
        },
      );
    });
  });

  describe('rdme guides', () => {
    it('should error if no path provided', async () => {
      return expect(
        (await runCommandWithHooks(['guides', '--key', key, '--version', '1.0.0'])).error.message,
      ).toContain('Missing 1 required arg:\npath');
    });
  });
});
