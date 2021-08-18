const nock = require('nock');
const config = require('config');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const frontMatter = require('gray-matter');

const docs = require('../../src/cmds/docs');
const docsEdit = require('../../src/cmds/docs/edit');

const fixturesDir = `${__dirname}./../__fixtures__`;
const key = 'API_KEY';
const version = '1.0.0';
const category = 'CATEGORY_ID';
const apiSetting = 'API_SETTING_ID';

function getNockWithVersionHeader(v) {
  return nock(config.host, {
    reqheaders: {
      'x-readme-version': v,
    },
  });
}

function hashFileContents(contents) {
  return crypto.createHash('sha1').update(contents).digest('hex');
}

describe('rdme docs', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    expect.assertions(1);
    return expect(docs.run({})).rejects.toThrow('No project API key provided. Please use `--key`.');
  });

  it('should error if no folder provided', () => {
    expect.assertions(1);
    return expect(docs.run({ key, version: '1.0.0' })).rejects.toThrow(
      'No folder provided. Usage `rdme docs <folder> [options]`.'
    );
  });

  it.todo('should error if the argument isnt a folder');

  it.todo('should error if the folder contains no markdown files');

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
        .get(`/api/v1/docs/simple-doc`)
        .basicAuth({ user: key })
        .reply(200, { category, slug: simpleDoc.slug, lastUpdatedHash: 'anOldHash' })
        .get(`/api/v1/docs/another-doc`)
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

      const versionMock = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs.run({ folder: './__tests__/__fixtures__/existing-docs', key, version }).then(updatedDocs => {
        // All docs should have been updated because their hashes from the GET request were different from what they
        // are currently.
        expect(updatedDocs).toStrictEqual([
          {
            category,
            slug: simpleDoc.slug,
            body: simpleDoc.doc.content,
          },
          { category, slug: anotherDoc.slug, body: anotherDoc.doc.content },
        ]);

        getMocks.done();
        updateMocks.done();
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

      const versionMock = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs.run({ folder: './__tests__/__fixtures__/existing-docs', key, version }).then(skippedDocs => {
        expect(skippedDocs).toStrictEqual([
          '`simple-doc` was not updated because there were no changes.',
          '`another-doc` was not updated because there were no changes.',
        ]);

        getMocks.done();
        versionMock.done();
      });
    });
  });

  describe('new docs', () => {
    it('should create new doc', () => {
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
        .post(`/api/v1/docs`, { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201, { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash });

      const versionMock = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs.run({ folder: './__tests__/__fixtures__/new-docs', key, version }).then(() => {
        getMock.done();
        postMock.done();
        versionMock.done();
      });
    });

    it('should create only valid docs', () => {
      console.log = jest.fn();
      expect.assertions(2);

      const slug = 'fail-doc';
      const slugTwo = 'new-doc';

      const doc = frontMatter(fs.readFileSync(path.join(fixturesDir, `/failure-docs/${slug}.md`)));
      const docTwo = frontMatter(fs.readFileSync(path.join(fixturesDir, `/failure-docs/${slugTwo}.md`)));

      const hash = hashFileContents(fs.readFileSync(path.join(fixturesDir, `/failure-docs/${slug}.md`)));
      const hashTwo = hashFileContents(fs.readFileSync(path.join(fixturesDir, `/failure-docs/${slugTwo}.md`)));

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
        .reply(400, {
          error: 'DOC_INVALID',
          message: "We couldn't save this doc (Path `category` is required.).",
        });

      const versionMock = nock(config.host)
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version });

      return docs.run({ folder: './__tests__/__fixtures__/failure-docs', key, version }).then(message => {
        expect(console.log).toHaveBeenCalledTimes(1);
        expect(message).toStrictEqual([
          {
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
          },
        ]);

        getMocks.done();
        postMocks.done();
        versionMock.done();

        console.log.mockRestore();
      });
    });
  });
});

describe('rdme docs:edit', () => {
  beforeEach(() => {
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  it('should error if no api key provided', () => {
    return expect(docsEdit.run({})).rejects.toThrow('No project API key provided. Please use `--key`.');
  });

  it('should error if no slug provided', () => {
    return expect(docsEdit.run({ key, version: '1.0.0' })).rejects.toThrow(
      'No slug provided. Usage `rdme docs:edit <slug> [options]`.'
    );
  });

  it('should fetch the doc from the api', () => {
    expect.assertions(4);
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

    const versionMock = nock(config.host)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    function mockEditor(filename, cb) {
      expect(filename).toBe(`${slug}.md`);
      expect(fs.existsSync(filename)).toBe(true);
      fs.appendFile(filename, edits, cb.bind(null, 0));
    }

    return docsEdit.run({ slug, key, version: '1.0.0', mockEditor }).then(() => {
      getMock.done();
      putMock.done();
      versionMock.done();
      expect(fs.existsSync(`${slug}.md`)).toBe(false);

      expect(console.log).toHaveBeenCalledWith('Doc successfully updated. Cleaning up local file.');
    });
  });

  it('should error if remote doc does not exist', () => {
    expect.assertions(2);
    const slug = 'no-such-doc';

    const getMock = nock(config.host)
      .get(`/api/v1/docs/${slug}`)
      .reply(404, {
        error: 'DOC_NOTFOUND',
        message: `The doc with the slug '${slug}' couldn't be found`,
        suggestion: '...a suggestion to resolve the issue...',
        help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
      });

    const versionMock = nock(config.host)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    return docsEdit.run({ slug, key, version: '1.0.0' }).catch(err => {
      getMock.done();
      versionMock.done();
      expect(err.code).toBe('DOC_NOTFOUND');
      expect(err.message).toContain("The doc with the slug 'no-such-doc' couldn't be found");
    });
  });

  it('should error if doc fails validation', () => {
    expect.assertions(2);
    const slug = 'getting-started';
    const body = 'abcdef';

    const getMock = nock(config.host).get(`/api/v1/docs/${slug}`).reply(200, { body });

    const putMock = nock(config.host).put(`/api/v1/docs/${slug}`).reply(400, {
      error: 'DOC_INVALID',
      message: "We couldn't save this doc ({error})",
      suggestion: '...a suggestion to resolve the issue...',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    });

    const versionMock = nock(config.host)
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    function mockEditor(filename, cb) {
      return cb(0);
    }

    return docsEdit.run({ slug, key, version: '1.0.0', mockEditor }).catch(err => {
      expect(err.code).toBe('DOC_INVALID');
      getMock.done();
      putMock.done();
      versionMock.done();
      expect(fs.existsSync(`${slug}.md`)).toBe(true);
      fs.unlinkSync(`${slug}.md`);
    });
  });

  it('should handle error if $EDITOR fails', () => {
    expect.assertions(1);
    const slug = 'getting-started';
    const body = 'abcdef';

    const getMock = nock(config.host)
      .get(`/api/v1/docs/${slug}`)
      .reply(200, { body })
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    function mockEditor(filename, cb) {
      return cb(1);
    }

    return docsEdit.run({ slug, key, version: '1.0.0', mockEditor }).catch(err => {
      getMock.done();
      expect(err.message).toBe('Non zero exit code from $EDITOR');
      fs.unlinkSync(`${slug}.md`);
    });
  });
});
