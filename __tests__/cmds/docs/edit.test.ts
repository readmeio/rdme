import fs from 'fs';

import DocsEditCommand from '../../../src/cmds/docs/edit';
import APIError from '../../../src/lib/apiError';
import getAPIMock, { getAPIMockWithVersionHeader } from '../../helpers/get-api-mock';

const docsEdit = new DocsEditCommand();

const key = 'API_KEY';
const version = '1.0.0';
const category = 'CATEGORY_ID';

describe('rdme docs:edit', () => {
  it('should error if no api key provided', () => {
    return expect(docsEdit.run({})).rejects.toStrictEqual(
      new Error('No project API key provided. Please use `--key`.')
    );
  });

  it('should error if no slug provided', () => {
    return expect(docsEdit.run({ key, version: '1.0.0' })).rejects.toThrow(
      'No slug provided. Usage `rdme docs:edit <slug> [options]`.'
    );
  });

  it('should fetch the doc from the api', async () => {
    expect.assertions(5);
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    const slug = 'getting-started';
    const body = 'abcdef';
    const edits = 'ghijkl';

    const getMock = getAPIMockWithVersionHeader(version)
      .get(`/api/v1/docs/${slug}`)
      .basicAuth({ user: key })
      .reply(200, { category, slug, body });

    const putMock = getAPIMockWithVersionHeader(version)
      .put(`/api/v1/docs/${slug}`, {
        category,
        slug,
        body: `${body}${edits}`,
      })
      .basicAuth({ user: key })
      .reply(200, { category, slug });

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

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
    // eslint-disable-next-line no-console
    expect(console.info).toHaveBeenCalledWith('Doc successfully updated. Cleaning up local file.');
    consoleSpy.mockRestore();
  });

  it('should error if remote doc does not exist', async () => {
    const slug = 'no-such-doc';

    const errorObject = {
      error: 'DOC_NOTFOUND',
      message: `The doc with the slug '${slug}' couldn't be found`,
      suggestion: '...a suggestion to resolve the issue...',
      help: 'If you need help, email support@readme.io and mention log "fake-metrics-uuid".',
    };

    const getMock = getAPIMock().get(`/api/v1/docs/${slug}`).reply(404, errorObject);

    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

    await expect(docsEdit.run({ slug, key, version: '1.0.0' })).rejects.toThrow(new APIError(errorObject));

    getMock.done();
    versionMock.done();
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

    const getMock = getAPIMock().get(`/api/v1/docs/${slug}`).reply(200, { body });
    const putMock = getAPIMock().put(`/api/v1/docs/${slug}`).reply(400, errorObject);
    const versionMock = getAPIMock().get(`/api/v1/version/${version}`).basicAuth({ user: key }).reply(200, { version });

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

    const getMock = getAPIMock()
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
