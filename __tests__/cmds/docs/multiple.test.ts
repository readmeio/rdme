import fs from 'node:fs';
import path from 'node:path';

import frontMatter from 'gray-matter';
import nock from 'nock';
import { describe, beforeAll, afterAll, afterEach, it, expect, vi } from 'vitest';

import DocsCommand from '../../../src/cmds/docs/index.js';
import getAPIMock, { getAPIMockWithVersionHeader } from '../../helpers/get-api-mock.js';
import hashFileContents from '../../helpers/hash-file-contents.js';

const docs = new DocsCommand();

const fixturesBaseDir = '__fixtures__/docs';
const fullFixturesDir = `${__dirname}./../../${fixturesBaseDir}`;

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme docs (multiple)', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => nock.cleanAll());

  it('should upload parent docs first', async () => {
    const dir = 'multiple-docs';
    const slugs = ['grandparent', 'parent', 'child', 'friend'];
    let id = 1234;

    const mocks = slugs.flatMap(slug => {
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/${dir}/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/${dir}/${slug}.md`)));

      return [
        getAPIMockWithVersionHeader(version)
          .get(`/api/v1/docs/${slug}`)
          .basicAuth({ user: key })
          .reply(404, {
            error: 'DOC_NOTFOUND',
            message: `The doc with the slug '${slug}' couldn't be found`,
            suggestion: '...a suggestion to resolve the issue...',
            help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
          }),
        getAPIMockWithVersionHeader(version)
          .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
          .basicAuth({ user: key })
          // eslint-disable-next-line no-plusplus
          .reply(201, { slug, _id: id++, body: doc.content, ...doc.data, lastUpdatedHash: hash }),
      ];
    });

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    const promise = docs.run({ filePath: `./__tests__/${fixturesBaseDir}/${dir}`, key, version });

    await expect(promise).resolves.toStrictEqual(
      [
        `🌱 successfully created 'friend' (ID: 1237) with contents from __tests__/${fixturesBaseDir}/${dir}/friend.md`,
        `🌱 successfully created 'grandparent' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/${dir}/grandparent.md`,
        `🌱 successfully created 'parent' (ID: 1235) with contents from __tests__/${fixturesBaseDir}/${dir}/parent.md`,
        `🌱 successfully created 'child' (ID: 1236) with contents from __tests__/${fixturesBaseDir}/${dir}/child.md`,
      ].join('\n'),
    );

    mocks.forEach(mock => mock.done());
    versionMock.done();
  });

  it('should upload docs with parent doc ids first', async () => {
    const dir = 'docs-with-parent-ids';
    const slugs = ['child', 'friend', 'with-parent-doc', 'parent'];
    let id = 1234;

    const mocks = slugs.flatMap(slug => {
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/${dir}/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/${dir}/${slug}.md`)));

      return [
        getAPIMockWithVersionHeader(version)
          .get(`/api/v1/docs/${slug}`)
          .basicAuth({ user: key })
          .reply(404, {
            error: 'DOC_NOTFOUND',
            message: `The doc with the slug '${slug}' couldn't be found`,
            suggestion: '...a suggestion to resolve the issue...',
            help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
          }),
        getAPIMockWithVersionHeader(version)
          .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
          .basicAuth({ user: key })
          // eslint-disable-next-line no-plusplus
          .reply(201, { slug, _id: id++, body: doc.content, ...doc.data, lastUpdatedHash: hash }),
      ];
    });

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    const promise = docs.run({ filePath: `./__tests__/${fixturesBaseDir}/${dir}`, key, version });

    await expect(promise).resolves.toStrictEqual(
      [
        `🌱 successfully created 'with-parent-doc' (ID: 1236) with contents from __tests__/${fixturesBaseDir}/${dir}/with-parent-doc.md`,
        `🌱 successfully created 'friend' (ID: 1235) with contents from __tests__/${fixturesBaseDir}/${dir}/friend.md`,
        `🌱 successfully created 'parent' (ID: 1237) with contents from __tests__/${fixturesBaseDir}/${dir}/parent.md`,
        `🌱 successfully created 'child' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/${dir}/child.md`,
      ].join('\n'),
    );

    mocks.forEach(mock => mock.done());
    versionMock.done();
  });

  it('should upload child docs without the parent', async () => {
    const dir = 'multiple-docs-no-parents';
    const slugs = ['child', 'friend'];
    let id = 1234;

    const mocks = slugs.flatMap(slug => {
      const doc = frontMatter(fs.readFileSync(path.join(fullFixturesDir, `/${dir}/${slug}.md`)));
      const hash = hashFileContents(fs.readFileSync(path.join(fullFixturesDir, `/${dir}/${slug}.md`)));

      return [
        getAPIMockWithVersionHeader(version)
          .get(`/api/v1/docs/${slug}`)
          .basicAuth({ user: key })
          .reply(404, {
            error: 'DOC_NOTFOUND',
            message: `The doc with the slug '${slug}' couldn't be found`,
            suggestion: '...a suggestion to resolve the issue...',
            help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
          }),
        getAPIMockWithVersionHeader(version)
          .post('/api/v1/docs', { slug, body: doc.content, ...doc.data, lastUpdatedHash: hash })
          .basicAuth({ user: key })
          // eslint-disable-next-line no-plusplus
          .reply(201, { slug, _id: id++, body: doc.content, ...doc.data, lastUpdatedHash: hash }),
      ];
    });

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    const promise = docs.run({ filePath: `./__tests__/${fixturesBaseDir}/${dir}`, key, version });

    await expect(promise).resolves.toStrictEqual(
      [
        `🌱 successfully created 'child' (ID: 1234) with contents from __tests__/${fixturesBaseDir}/${dir}/child.md`,
        `🌱 successfully created 'friend' (ID: 1235) with contents from __tests__/${fixturesBaseDir}/${dir}/friend.md`,
      ].join('\n'),
    );

    mocks.forEach(mock => mock.done());
    versionMock.done();
  });

  it('should return an error message when it encounters a cycle', async () => {
    const dir = 'multiple-docs-cycle';
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    const promise = docs.run({ filePath: `./__tests__/${fixturesBaseDir}/${dir}`, key, version });

    await expect(promise).rejects.toThrow('Cyclic dependency');
    versionMock.done();
  });
});
