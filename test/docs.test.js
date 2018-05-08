const nock = require('nock');
const config = require('config');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const frontMatter = require('gray-matter');

const docs = require('../cli').bind(null, 'docs');

const key = 'Xmw4bGctRVIQz7R7dQXqH9nQe5d0SPQs';
const version = '1.0.0';

describe('docs command', () => {
  beforeAll(() => nock.disableNetConnect());
  afterAll(() => nock.cleanAll());

  it('should error if no api key provided', () =>
    docs([], {}).catch(err => {
      assert.equal(err.message, 'No api key provided. Please use --key');
    }));

  it('should error if no version provided', () =>
    docs([], { key }).catch(err => {
      assert.equal(err.message, 'No version provided. Please use --version');
    }));

  it('should error if no folder provided', () =>
    docs([], { key, version: '1.0.0' }).catch(err => {
      assert.equal(err.message, 'No folder provided. Usage `rdme docs <folder>`');
    }));

  it('should error if the argument isnt a folder');
  it('should error if the folder contains no markdown files');

  describe('existing docs', () => {
    it('should fetch doc and merge with what is returned', () => {
      const slug = 'simple-doc';
      const doc = frontMatter(
        fs.readFileSync(path.join(__dirname, `./fixtures/existing-docs/${slug}.md`)),
      );
      const hash = crypto
        .createHash('sha1')
        .update(fs.readFileSync(path.join(__dirname, `./fixtures/existing-docs/${slug}.md`)))
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

      return docs(['./test/fixtures/existing-docs'], { key, version }).then(() => {
        getMock.done();
        putMock.done();
      });
    });

    it('should not send requests for docs that have not changed', () => {
      const slug = 'simple-doc';
      const hash = crypto
        .createHash('sha1')
        .update(fs.readFileSync(path.join(__dirname, `./fixtures/existing-docs/${slug}.md`)))
        .digest('hex');

      const getMock = nock(config.host, {
        reqheaders: {
          'x-readme-version': version,
        },
      })
        .get(`/api/v1/docs/${slug}`)
        .basicAuth({ user: key })
        .reply(200, { category: '5ae9ece93a685f47efb9a97c', slug, lastUpdatedHash: hash });

      return docs(['./test/fixtures/existing-docs'], { key, version }).then(() => {
        getMock.done();
      });
    });
  });

  describe('new docs', () => {
    it('should create new doc', () => {
      const slug = 'new-doc';
      const doc = frontMatter(
        fs.readFileSync(path.join(__dirname, `./fixtures/new-docs/${slug}.md`)),
      );
      const hash = crypto
        .createHash('sha1')
        .update(fs.readFileSync(path.join(__dirname, `./fixtures/new-docs/${slug}.md`)))
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

      return docs(['./test/fixtures/new-docs'], { key, version }).then(() => {
        getMock.done();
        postMock.done();
      });
    });
  });
});
