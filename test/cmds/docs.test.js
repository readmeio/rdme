const nock = require('nock');
const config = require('config');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const frontMatter = require('gray-matter');

const docs = require('../../cmds/docs/index');
const docsEdit = require('../../cmds/docs/edit');

const fixturesDir = `${__dirname}./../fixtures`;
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
    return expect(docs.run({ key })).rejects.toThrow(
      'No project version provided. Please use `--version`.',
    );
  });

  it('should error if no folder provided', () => {
    expect.assertions(1);
    return expect(docs.run({ key, version: '1.0.0' })).rejects.toThrow(
      'No folder provided. Usage `rdme docs <folder> [options]`.',
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

      return docs.run({ folder: './test/fixtures/existing-docs', key, version }).then(() => {
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

      return docs
        .run({ folder: './test/fixtures/existing-docs', key, version })
        .then(([message]) => {
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
          description: 'No doc found with that slug',
          error: 'Not Found',
        });

      const postMock = nock(config.host, {
        reqheaders: {
          'x-readme-version': version,
        },
      })
        .post(`/api/v1/docs`, { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
        .basicAuth({ user: key })
        .reply(201);

      return docs.run({ folder: './test/fixtures/new-docs', key, version }).then(() => {
        getMock.done();
        postMock.done();
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
    return expect(docsEdit.run({})).rejects.toThrow(
      'No project API key provided. Please use `--key`.',
    );
  });

  it('should error if no version provided', () => {
    return expect(docsEdit.run({ key })).rejects.toThrow(
      'No project version provided. Please use `--version`.',
    );
  });

  it('should error if no slug provided', () => {
    return expect(docsEdit.run({ key, version: '1.0.0' })).rejects.toThrow(
      'No slug provided. Usage `rdme docs:edit <slug> [options]`.',
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
      .reply(404, { error: 'Not Found', description: 'No doc found with that slug' });

    return docsEdit.run({ slug, key, version: '1.0.0' }).catch(err => {
      getMock.done();
      expect(err.error).toBe('Not Found');
      expect(err.description).toBe('No doc found with that slug');
    });
  });

  it('should error if doc fails validation', () => {
    expect.assertions(2);
    const slug = 'getting-started';

    const getMock = nock(config.host)
      .get(`/api/v1/docs/${slug}`)
      .reply(200, {});

    const putMock = nock(config.host)
      .put(`/api/v1/docs/${slug}`)
      .reply(400, { error: 'Bad Request' });

    function mockEditor(filename, cb) {
      return cb(0);
    }

    return docsEdit.run({ slug, key, version: '1.0.0', mockEditor }).catch(err => {
      expect(err.error).toBe('Bad Request');
      getMock.done();
      putMock.done();
      expect(fs.existsSync(`${slug}.md`)).toBe(true);
      fs.unlinkSync(`${slug}.md`);
    });
  });

  it('should handle error if $EDITOR fails', () => {
    expect.assertions(1);
    const slug = 'getting-started';
    nock(config.host)
      .get(`/api/v1/docs/${slug}`)
      .reply(200, {});

    function mockEditor(filename, cb) {
      return cb(1);
    }

    return docsEdit.run({ slug, key, version: '1.0.0', mockEditor }).catch(err => {
      expect(err.message).toBe('Non zero exit code from $EDITOR');
      fs.unlinkSync(`${slug}.md`);
    });
  });
});
