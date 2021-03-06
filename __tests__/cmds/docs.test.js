const nock = require('nock');
const config = require('config');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const frontMatter = require('gray-matter');

const docs = require('../../src/cmds/docs');
const docsEdit = require('../../src/cmds/docs/edit');

const fixturesDir = `${__dirname}./../__fixtures__`;
const key = 'Xmw4bGctRVIQz7R7dQXqH9nQe5d0SPQs';
const version = '1.0.0';

describe('rdme docs', () => {
  beforeAll(() => nock.disableNetConnect());

  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', () => {
    expect.assertions(1);
    return expect(docs.run({})).rejects.toThrow('No project API key provided. Please use `--key`.');
  });

  it('should error if no version provided', () => {
    expect.assertions(1);
    return expect(docs.run({ key })).rejects.toThrow('No project version provided. Please use `--version`.');
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
    it('should fetch doc and merge with what is returned', () => {
      const slug = 'simple-doc';
      const doc = frontMatter(fs.readFileSync(path.join(fixturesDir, `/existing-docs/${slug}.md`)));
      const hash = crypto
        .createHash('sha1')
        .update(fs.readFileSync(path.join(fixturesDir, `/existing-docs/${slug}.md`)))
        .digest('hex');

      const getMock = nock(config.host, {
        reqheaders: {
          'x-readme-version': version,
        },
      })
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(200, { category: '5ae9ece93a685f47efb9a97c', slug });

      const putMock = nock(config.host, {
        reqheaders: {
          'x-readme-version': version,
        },
      })
        .put(`/api/v1/docs/${slug}`, {
          category: '5ae9ece93a685f47efb9a97c',
          slug,
          body: doc.content,
          lastUpdatedHash: hash,
          ...doc.data,
        })
        .basicAuth({ user: key })
        .reply(200);

      return docs.run({ folder: './__tests__/__fixtures__/existing-docs', key, version }).then(() => {
        getMock.done();
        putMock.done();
      });
    });

    it('should not send requests for docs that have not changed', () => {
      expect.assertions(1);
      const slug = 'simple-doc';
      const hash = crypto
        .createHash('sha1')
        .update(fs.readFileSync(path.join(fixturesDir, `/existing-docs/${slug}.md`)))
        .digest('hex');

      const getMock = nock(config.host, {
        reqheaders: {
          'x-readme-version': version,
        },
      })
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(200, { category: '5ae9ece93a685f47efb9a97c', slug, lastUpdatedHash: hash });

      return docs.run({ folder: './__tests__/__fixtures__/existing-docs', key, version }).then(([message]) => {
        expect(message).toBe('`simple-doc` not updated. No changes.');
        getMock.done();
      });
    });
  });

  describe('new docs', () => {
    it('should create new doc', () => {
      const slug = 'new-doc';
      const doc = frontMatter(fs.readFileSync(path.join(fixturesDir, `/new-docs/${slug}.md`)));
      const hash = crypto
        .createHash('sha1')
        .update(fs.readFileSync(path.join(fixturesDir, `/new-docs/${slug}.md`)))
        .digest('hex');

      const getMock = nock(config.host, {
        reqheaders: {
          'x-readme-version': version,
        },
      })
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = nock(config.host, {
        reqheaders: {
          'x-readme-version': version,
        },
      })
        .post(`/api/v1/docs`, { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201);

      return docs.run({ folder: './__tests__/__fixtures__/new-docs', key, version }).then(() => {
        getMock.done();
        postMock.done();
      });
    });

    it('should create only valid docs', () => {
      console.log = jest.fn();
      expect.assertions(2);
      const slug = 'fail-doc';
      const slugTwo = 'new-doc';
      const doc = frontMatter(fs.readFileSync(path.join(fixturesDir, `/failure-docs/${slug}.md`)));
      const docTwo = frontMatter(fs.readFileSync(path.join(fixturesDir, `/failure-docs/${slugTwo}.md`)));
      const hash = crypto
        .createHash('sha1')
        .update(fs.readFileSync(path.join(fixturesDir, `/failure-docs/${slug}.md`)))
        .digest('hex');

      const hashTwo = crypto
        .createHash('sha1')
        .update(fs.readFileSync(path.join(fixturesDir, `/failure-docs/${slugTwo}.md`)))
        .digest('hex');

      const getMock = nock(config.host, {
        reqheaders: {
          'x-readme-version': version,
        },
      })
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slug}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const getMockTwo = nock(config.host, {
        reqheaders: {
          'x-readme-version': version,
        },
      })
        .get(`/api/v1/docs/${slugTwo}`)
        .basicAuth({ user: key })
        .reply(404, {
          error: 'DOC_NOTFOUND',
          message: `The doc with the slug '${slugTwo}' couldn't be found`,
          suggestion: '...a suggestion to resolve the issue...',
          help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
        });

      const postMock = nock(config.host, {
        reqheaders: {
          'x-readme-version': version,
        },
      })
        .post(`/api/v1/docs`, { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(400, {
          error: 'DOC_INVALID',
          message: "We couldn't save this doc (Path `category` is required.).",
        });

      const postMockTwo = nock(config.host, {
        reqheaders: {
          'x-readme-version': version,
        },
      })
        .post(`/api/v1/docs`, { slug: slugTwo, body: docTwo.content, ...docTwo.data, lastUpdatedHash: hashTwo })
        .basicAuth({ user: key })
        .reply(201, {
          metadata: { image: [], title: '', description: '' },
          api: {
            method: 'post',
            url: '',
            auth: 'required',
            params: [],
            apiSetting: '60ddf83e30681022753e27af',
          },
          title: 'This is the document title',
          updates: [],
          type: 'endpoint',
          slug: slugTwo,
          body: 'Body',
          category: '5ae122e10fdf4e39bb34db6f',
        });

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
              apiSetting: '60ddf83e30681022753e27af',
            },
            title: 'This is the document title',
            updates: [],
            type: 'endpoint',
            slug: slugTwo,
            body: 'Body',
            category: '5ae122e10fdf4e39bb34db6f',
          },
        ]);
        getMock.done();
        getMockTwo.done();
        postMock.done();
        postMockTwo.done();
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

  it('should error if no version provided', () => {
    return expect(docsEdit.run({ key })).rejects.toThrow('No project version provided. Please use `--version`.');
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

    const getMock = nock(config.host, {
      reqheaders: {
        'x-readme-version': version,
      },
    })
      .get(`/api/v1/docs/${slug}`)
      .basicAuth({ user: key })
      .reply(200, { category: '5ae9ece93a685f47efb9a97c', slug, body });

    const putMock = nock(config.host, {
      reqheaders: {
        'x-readme-version': version,
      },
    })
      .put(`/api/v1/docs/${slug}`, {
        category: '5ae9ece93a685f47efb9a97c',
        slug,
        body: `${body}${edits}`,
      })
      .basicAuth({ user: key })
      .reply(200);

    function mockEditor(filename, cb) {
      expect(filename).toBe(`${slug}.md`);
      expect(fs.existsSync(filename)).toBe(true);
      fs.appendFile(filename, edits, cb.bind(null, 0));
    }

    return docsEdit.run({ slug, key, version: '1.0.0', mockEditor }).then(() => {
      getMock.done();
      putMock.done();
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

    return docsEdit.run({ slug, key, version: '1.0.0' }).catch(err => {
      getMock.done();
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

    function mockEditor(filename, cb) {
      return cb(0);
    }

    return docsEdit.run({ slug, key, version: '1.0.0', mockEditor }).catch(err => {
      expect(err.code).toBe('DOC_INVALID');
      getMock.done();
      putMock.done();
      expect(fs.existsSync(`${slug}.md`)).toBe(true);
      fs.unlinkSync(`${slug}.md`);
    });
  });

  it('should handle error if $EDITOR fails', () => {
    expect.assertions(1);
    const slug = 'getting-started';
    const body = 'abcdef';

    nock(config.host).get(`/api/v1/docs/${slug}`).reply(200, { body });

    function mockEditor(filename, cb) {
      return cb(1);
    }

    return docsEdit.run({ slug, key, version: '1.0.0', mockEditor }).catch(err => {
      expect(err.message).toBe('Non zero exit code from $EDITOR');
      fs.unlinkSync(`${slug}.md`);
    });
  });
});
