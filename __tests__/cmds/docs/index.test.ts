/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import frontMatter from 'gray-matter';
import nock from 'nock';
import prompts from 'prompts';

import DocsCommand from '../../../src/cmds/docs';
import GuidesCommand from '../../../src/cmds/guides';
import APIError from '../../../src/lib/apiError';
import expectOSAgnostic from '../../helpers/expect-os-agnostic';
import getAPIMock, { getAPIMockWithVersionHeader } from '../../helpers/get-api-mock';
import { after, before } from '../../helpers/get-gha-setup';
import hashFileContents from '../../helpers/hash-file-contents';

const docs = new DocsCommand();
const guides = new GuidesCommand();

const fixturesBaseDir = '__fixtures__/docs';
const fullFixturesDir = `${__dirname}./../../${fixturesBaseDir}`;

const key = 'API_KEY';
const version = '1.0.0';
const category = 'CATEGORY_ID';
const apiSetting = 'API_SETTING_ID';

const testWorkingDir = process.cwd();

describe.only('rdme docs', () => {
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

  it('should error if no path provided', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docs.run({ key, version: '1.0.0' })).rejects.toStrictEqual(
      new Error('No path provided. Usage `rdme docs <path> [options]`.')
    );

    versionMock.done();
  });

  it('should error if the argument is not a folder', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docs.run({ key, version: '1.0.0', filePath: 'not-a-folder' })).rejects.toStrictEqual(
      new Error("Oops! We couldn't locate a file or directory at the path you provided.")
    );

    versionMock.done();
  });

  it('should error if the folder contains no markdown files', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docs.run({ key, version: '1.0.0', filePath: '.github/workflows' })).rejects.toStrictEqual(
      new Error(
        "The directory you provided (.github/workflows) doesn't contain any of the following required files: .markdown, .md."
      )
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

      return docs.run({ filePath: `./__tests__/${fixturesBaseDir}/existing-docs`, key, version }).then(updatedDocs => {
        // All docs should have been updated because their hashes from the GET request were different from what they
        // are currently.
        expectOSAgnostic(updatedDocs).toBe(
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
        .run({ dryRun: true, filePath: `./__tests__/${fixturesBaseDir}/existing-docs`, key, version })
        .then(updatedDocs => {
          // All docs should have been updated because their hashes from the GET request were different from what they
          // are currently.
          expectOSAgnostic(updatedDocs).toBe(
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

      return docs.run({ filePath: `./__tests__/${fixturesBaseDir}/existing-docs`, key, version }).then(skippedDocs => {
        expectOSAgnostic(skippedDocs).toBe(
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
        .run({ dryRun: true, filePath: `./__tests__/${fixturesBaseDir}/existing-docs`, key, version })
        .then(skippedDocs => {
          expectOSAgnostic(skippedDocs).toBe(
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

      await expectOSAgnostic(
        docs.run({ filePath: `./__tests__/${fixturesBaseDir}/new-docs`, key, version })
      ).resolves.toBe(
        `🌱 successfully created 'new-doc' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/new-docs/new-doc.md`
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

      await expectOSAgnostic(
        docs.run({ dryRun: true, filePath: `./__tests__/${fixturesBaseDir}/new-docs`, key, version })
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

      await expect(docs.run({ filePath: `./${fullDirectory}`, key, version })).rejects.toStrictEqual(
        new APIError(formattedErrorObject)
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

      await expectOSAgnostic(
        docs.run({ filePath: `./__tests__/${fixturesBaseDir}/slug-docs`, key, version })
      ).resolves.toBe(
        `🌱 successfully created 'marc-actually-wrote-a-test' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/slug-docs/new-doc-slug.md`
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });
  });

  describe('GHA onboarding E2E tests', () => {
    let consoleInfoSpy;
    let yamlOutput;

    const getCommandOutput = () => {
      return [consoleInfoSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
    };

    beforeEach(() => {
      consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

      before((fileName, data) => {
        yamlOutput = data;
      });
    });

    afterEach(() => {
      after();

      consoleInfoSpy.mockRestore();
      process.chdir(testWorkingDir);
    });

    it('should create GHA workflow with version passed in via prompt', async () => {
      const altVersion = '1.0.1';
      const slug = 'new-doc';
      const id = '1234';
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/new-docs/${slug}.md`)));

      const versionsMock = getAPIMock()
        .get('/api/v1/version')
        .basicAuth({ user: key })
        .reply(200, [{ version: altVersion }]);

      const getMock = getAPIMockWithVersionHeader(altVersion)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getAPIMockWithVersionHeader(altVersion)
        .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { _id: id, slug, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const fileName = 'docs-test-file';
      prompts.inject([altVersion, true, 'docs-test-branch', fileName]);

      await expectOSAgnostic(
        docs.run({ filePath: `./__tests__/${fixturesBaseDir}/new-docs`, key })
      ).resolves.toMatchSnapshot();

      expectOSAgnostic(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join('.github', 'workflows', `${fileName}.yml`),
        expect.any(String)
      );
      expect(console.info).toHaveBeenCalledTimes(2);
      const output = getCommandOutput();
      expect(output).toMatch("Looks like you're running this command in a GitHub Repository!");
      expect(output).toMatch(`successfully created '${slug}' (ID: ${id}) with contents from`);

      versionsMock.done();
      getMock.done();
      postMock.done();
    });

    it('should create GHA workflow with version passed in via opt', async () => {
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

      const fileName = 'docs-test-file';
      prompts.inject([true, 'docs-test-branch', fileName]);

      await expectOSAgnostic(
        docs.run({ filePath: `./__tests__/${fixturesBaseDir}/new-docs`, key, version })
      ).resolves.toMatchSnapshot();

      expectOSAgnostic(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join('.github', 'workflows', `${fileName}.yml`),
        expect.any(String)
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });

    it('should create GHA workflow with version passed as opt (github flag enabled)', async () => {
      expect.assertions(3);

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

      const fileName = 'docs-test-file-github-flag';
      prompts.inject(['docs-test-branch-github-flag', fileName]);

      await expectOSAgnostic(
        docs.run({ filePath: `./__tests__/${fixturesBaseDir}/new-docs`, github: true, key, version })
      ).resolves.toMatchSnapshot();

      expectOSAgnostic(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join('.github', 'workflows', `${fileName}.yml`),
        expect.any(String)
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });

    it('should reject if user says no to creating GHA workflow', async () => {
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

      prompts.inject([false]);

      await expect(
        docs.run({ filePath: `./__tests__/${fixturesBaseDir}/new-docs`, key, version })
      ).rejects.toStrictEqual(
        new Error(
          'GitHub Actions workflow creation cancelled. If you ever change your mind, you can run this command again with the `--github` flag.'
        )
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });
  });
});

describe('rdme guides', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  it('should error if no path provided', async () => {
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(guides.run({ key, version: '1.0.0' })).rejects.toStrictEqual(
      new Error('No path provided. Usage `rdme guides <path> [options]`.')
    );

    versionMock.done();
  });
});
