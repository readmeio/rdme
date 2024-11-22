import nock from 'nock';
import { describe, beforeAll, afterEach, it, expect } from 'vitest';

import Command from '../../../src/commands/categories/index.js';
import { getAPIV1Mock, getAPIV1MockWithVersionHeader } from '../../helpers/get-api-mock.js';
import { runCommand } from '../../helpers/oclif.js';

const key = 'API_KEY';
const version = '1.0.0';

describe('rdme categories', () => {
  let run: (args?: string[]) => Promise<string>;

  beforeAll(() => {
    nock.disableNetConnect();
    run = (args: string[]) =>
      runCommand(Command)(args).then(({ error, result }) => {
        if (error) {
          throw error;
        }
        return result;
      });
  });

  afterEach(() => nock.cleanAll());

  it('should return all categories for a single page', async () => {
    const getMock = getAPIV1MockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'One Category', slug: 'one-category', type: 'guide' }], {
        'x-total-count': '1',
      });

    const versionMock = getAPIV1Mock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    await expect(run(['--key', key, '--version', '1.0.0'])).resolves.toBe(
      JSON.stringify([{ title: 'One Category', slug: 'one-category', type: 'guide' }], null, 2),
    );

    getMock.done();
    versionMock.done();
  });

  it('should return all categories for multiple pages', async () => {
    const getMock = getAPIV1MockWithVersionHeader(version)
      .persist()
      .get('/api/v1/categories?perPage=20&page=1')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'One Category', slug: 'one-category', type: 'guide' }], {
        'x-total-count': '21',
      })
      .get('/api/v1/categories?perPage=20&page=2')
      .basicAuth({ user: key })
      .reply(200, [{ title: 'Another Category', slug: 'another-category', type: 'guide' }], {
        'x-total-count': '21',
      });

    const versionMock = getAPIV1Mock()
      .get(`/api/v1/version/${version}`)
      .basicAuth({ user: key })
      .reply(200, { version });

    await expect(run(['--key', key, '--version', '1.0.0'])).resolves.toBe(
      JSON.stringify(
        [
          { title: 'One Category', slug: 'one-category', type: 'guide' },
          { title: 'Another Category', slug: 'another-category', type: 'guide' },
        ],
        null,
        2,
      ),
    );

    getMock.done();
    versionMock.done();
  });
});
