const nock = require('nock');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const frontMatter = require('gray-matter');

const APIError = require('../../src/lib/apiError');
const getApiNock = require('../get-api-nock');

const DocsCommand = require('../../src/cmds/docs');
const DocsEditCommand = require('../../src/cmds/docs/edit');

const docs = new DocsCommand();
const docsEdit = new DocsEditCommand();

const fixturesDir = `${__dirname}./../__fixtures__`;
const key = 'API_KEY';
const version = '1.0.0';
const category = 'CATEGORY_ID';
const apiSetting = 'API_SETTING_ID';

function getNockWithVersionHeader(v) {
  return getApiNock({
    'x-readme-version': v,
  });
}

function hashFileContents(contents) {
  return crypto.createHash('sha1').update(contents).digest('hex');
}

describe('rdme docs', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    return expect(docs.run({})).rejects.toThrow('No project API key provided. Please use `--key`.');
  });

  it('should error if no folder provided', () => {
    return expect(docs.run({ key, version: '1.0.0' })).rejects.toThrow(
      'No folder provided. Usage `rdme docs <folder> [options]`.'
    );
  });

  it('should error if the argument isnt a folder', async () => {
    const versionMock = getApiNock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docs.run({ key, version: '1.0.0', folder: 'not-a-folder' })).rejects.toThrow(
      "ENOENT: no such file or directory, scandir 'not-a-folder'"
    );

    versionMock.done();
  });

  it('should error if the folder contains no markdown files', async () => {
    const versionMock = getApiNock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docs.run({ key, version: '1.0.0', folder: '.github/workflows' })).rejects.toThrow(
      'We were unable to locate Markdown files in .github/workflows.'
    );

    versionMock.done();
  });

  describe('existing docs', () => {
    let simpleDoc;
    let anotherDoc;

    beforeEach(() => {
      let fileContents = fs.readFileSync(path.join(fixturesDir, `/existing-docs/simple-doc.md`));
      simpleDoc = {
        slug: 'simple-doc',
        doc: frontMatter(fileContents),
        hash: hashFileContents(fileContents),
      };

      fileContents = fs.readFileSync(path.join(fixturesDir, `/existing-docs/subdir/another-doc.md`));
      anotherDoc = {
        slug: 'another-doc',
        doc: frontMatter(fileContents),
        hash: hashFileContents(fileContents),
      };
    });

    it('should fetch doc and merge with what is returned', () => {
      expect.assertions(1);

      const getMocks = getNockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: 'anOldHash' });

      const updateMocks = getNockWithVersionHeader(version)
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

      const versionMock = getApiNock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs.run({ folder: './__tests__/__fixtures__/existing-docs', key, version }).then(updatedDocs => {
        // All docs should have been updated because their hashes from the GET request were different from what they
        // are currently.
        expect(updatedDocs).toBe(
          [
            "✏️ successfully updated 'simple-doc' with contents from __tests__/__fixtures__/existing-docs/simple-doc.md",
            "✏️ successfully updated 'another-doc' with contents from __tests__/__fixtures__/existing-docs/subdir/another-doc.md",
          ].join('\n')
        );

        getMocks.done();
        updateMocks.done();
        versionMock.done();
      });
    });

    it('should return doc update info for dry run', () => {
      expect.assertions(1);

      const getMocks = getNockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: 'anOldHash' });

      const versionMock = getApiNock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs
        .run({ dryRun: true, folder: './__tests__/__fixtures__/existing-docs', key, version })
        .then(updatedDocs => {
          // All docs should have been updated because their hashes from the GET request were different from what they
          // are currently.
          expect(updatedDocs).toBe(
            [
              `🎭 dry run! This will update 'simple-doc' with contents from __tests__/__fixtures__/existing-docs/simple-doc.md with the following metadata: ${JSON.stringify(
                simpleDoc.doc.data
              )}`,
              `🎭 dry run! This will update 'another-doc' with contents from __tests__/__fixtures__/existing-docs/subdir/another-doc.md with the following metadata: ${JSON.stringify(
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

      const getMocks = getNockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: anotherDoc.hash });

      const versionMock = getApiNock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs.run({ folder: './__tests__/__fixtures__/existing-docs', key, version }).then(skippedDocs => {
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

      const getMocks = getNockWithVersionHeader(version)
        .get('/api/v1/docs/simple-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: simpleDoc.hash })
        .get('/api/v1/docs/another-doc')
        .basicAuth({ user: key })
        .reply(200, { category, slug: anotherDoc.slug, lastUpdatedHash: anotherDoc.hash });

      const versionMock = getApiNock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs
        .run({ dryRun: true, folder: './__tests__/__fixtures__/existing-docs', key, version })
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
      const doc = frontMatter(fs.readFileSync(path.join(fixturesDir, `/new-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getNockWithVersionHeader(version)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getNockWithVersionHeader(version)
        .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = getApiNock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(docs.run({ folder: './__tests__/__fixtures__/new-docs', key, version })).resolves.toBe(
        "🌱 successfully created 'new-doc' with contents from __tests__/__fixtures__/new-docs/new-doc.md"
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });

    it('should return creation info for dry run', async () => {
      const slug = 'new-doc';
      const doc = frontMatter(fs.readFileSync(path.join(fixturesDir, `/new-docs/${slug}.md`)));

      const getMock = getNockWithVersionHeader(version)
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const versionMock = getApiNock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(docs.run({ dryRun: true, folder: './__tests__/__fixtures__/new-docs', key, version })).resolves.toBe(
        `🎭 dry run! This will create 'new-doc' with contents from __tests__/__fixtures__/new-docs/new-doc.md with the following metadata: ${JSON.stringify(
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

      const doc = frontMatter(fs.readFileSync(path.join(fixturesDir, `/${folder}/${slug}.md`)));
      const docTwo = frontMatter(fs.readFileSync(path.join(fixturesDir, `/${folder}/${slugTwo}.md`)));

      const hash = hashFileContents(fs.readFileSync(path.join(fixturesDir, `/${folder}/${slug}.md`)));
      const hashTwo = hashFileContents(fs.readFileSync(path.join(fixturesDir, `/${folder}/${slugTwo}.md`)));

      const getMocks = getNockWithVersionHeader(version)
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

      const postMocks = getNockWithVersionHeader(version)
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

      const versionMock = getApiNock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      const fullDirectory = `__tests__/__fixtures__/${folder}`;

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

  describe('slug metadata', () => {
    it('should use provided slug', async () => {
      const slug = 'new-doc-slug';
      const doc = frontMatter(fs.readFileSync(path.join(fixturesDir, `/slug-docs/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fixturesDir, `/slug-docs/${slug}.md`)));

      const getMock = getApiNock()
        .get(`/api/v1/docs/${doc.data.slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = getApiNock()
        .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug: doc.data.slug, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = getApiNock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      await expect(docs.run({ folder: './__tests__/__fixtures__/slug-docs', key, version })).resolves.toBe(
        "🌱 successfully created 'marc-actually-wrote-a-test' with contents from __tests__/__fixtures__/slug-docs/new-doc-slug.md"
      );

      getMock.done();
      postMock.done();
      versionMock.done();
    });
  });
});

describe('rdme docs:edit', () => {
  it('should error if no api key provided', () => {
    return expect(docsEdit.run({})).rejects.toThrow('No project API key provided. Please use `--key`.');
  });

  it('should error if no slug provided', () => {
    return expect(docsEdit.run({ key, version: '1.0.0' })).rejects.toThrow(
      'No slug provided. Usage `rdme docs:edit <slug> [options]`.'
    );
  });

  it('should fetch the doc from the api', async () => {
    expect.assertions(5);
    console.info = jest.fn();
    const slug = 'getting-started';
    const body = 'abcdef';
    const edits = 'ghijkl';

    const getMock = getNockWithVersionHeader(version)
      .get(`/api/v1/docs/${slug}`)
      .basicAuth({ user: key })
      .reply(200, { category, slug, body });

    const putMock = getNockWithVersionHeader(version)
      .put(`/api/v1/docs/${slug}`, {
        category,
        slug,
        body: `${body}${edits}`,
      })
      .basicAuth({ user: key })
      .reply(200, { category, slug });

    const versionMock = getApiNock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    function mockEditor(filename, cb) {
      expect(filename).toBe(`${slug}.md`);
      expect(fs.existsSync(filename)).toBe(true);
      fs.appendFile(filename, edits, cb.bind(null, 0));
    }

    await expect(docsEdit.run({ slug, key, version: '1.0.0', mockEditor })).resolves.toBeUndefined();

    getMock.done();
    putMock.done();
    versionMock.done();

    expect(fs.existsSync(`${slug}.md`)).toBe(false);
    expect(console.info).toHaveBeenCalledWith('Doc successfully updated. Cleaning up local file.');
    return console.info.mockRestore();
  });

  it('should error if remote doc does not exist', async () => {
    const slug = 'no-such-doc';

    const errorObject = {
      error: 'DOC_NOTFOUND',
      message: `The doc with the slug '${slug}' couldn't be found`,
      suggestion: '...a suggestion to resolve the issue...',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    const getMock = getApiNock().get(`/api/v1/docs/${slug}`).reply(404, errorObject);

    const versionMock = getApiNock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docsEdit.run({ slug, key, version: '1.0.0' })).rejects.toThrow(new APIError(errorObject));

    getMock.done();
    return versionMock.done();
  });

  it('should error if doc fails validation', async () => {
    const slug = 'getting-started';
    const body = 'abcdef';

    const errorObject = {
      error: 'DOC_INVALID',
      message: `We couldn't save this doc (${slug})`,
      suggestion: '...a suggestion to resolve the issue...',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    const getMock = getApiNock().get(`/api/v1/docs/${slug}`).reply(200, { body });
    const putMock = getApiNock().put(`/api/v1/docs/${slug}`).reply(400, errorObject);
    const versionMock = getApiNock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    function mockEditor(filename, cb) {
      return cb(0);
    }

    await expect(docsEdit.run({ slug, key, version: '1.0.0', mockEditor })).rejects.toThrow(new APIError(errorObject));

    getMock.done();
    putMock.done();
    versionMock.done();

    expect(fs.existsSync(`${slug}.md`)).toBe(true);
    fs.unlinkSync(`${slug}.md`);
  });

  it('should handle error if $EDITOR fails', async () => {
    const slug = 'getting-started';
    const body = 'abcdef';

    const getMock = getApiNock()
      .get(`/api/v1/docs/${slug}`)
      .reply(200, { body })
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    function mockEditor(filename, cb) {
      return cb(1);
    }

    await expect(docsEdit.run({ slug, key, version: '1.0.0', mockEditor })).rejects.toThrow(
      new Error('Non zero exit code from $EDITOR')
    );

    getMock.done();
    fs.unlinkSync(`${slug}.md`);
  });
});
