import nock from 'nock';
import prompts from 'prompts';
import slugify from 'slugify';
import { describe, beforeAll, beforeEach, afterEach, it, expect } from 'vitest';

import Command from '../../../src/commands/openapi/upload.js';
import petstore from '../../__fixtures__/petstore-simple-weird-version.json' with { type: 'json' };
import { getAPIv2Mock, getAPIv2MockForGHA } from '../../helpers/get-api-mock.js';
import { runCommand, type OclifOutput } from '../../helpers/oclif.js';
import { after, before } from '../../helpers/setup-gha-env.js';

const key = 'rdme_123';
const version = '1.0.0';
const filename = '__tests__/__fixtures__/petstore-simple-weird-version.json';
const fileUrl = 'https://example.com/openapi.json';
const slugifiedFilename = slugify.default(filename);

describe('rdme openapi upload', () => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(Command);
  });

  describe('flag error handling', () => {
    it('should throw if an error if both `--version` and `--useSpecVersion` flags are passed', async () => {
      const result = await run(['--useSpecVersion', '--version', version, filename, '--key', key]);
      expect(result).toMatchSnapshot();
    });
  });

  describe('given that the API definition is a local file', () => {
    it('should create a new API definition in ReadMe', async () => {
      const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/versions/${version}/apis`)
        .reply(200, { data: [] })
        .post(`/versions/${version}/apis`, body =>
          body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
        )
        .reply(200, {
          data: {
            upload: { status: 'done' },
            uri: `/versions/${version}/apis/${slugifiedFilename}`,
          },
        });

      const result = await run(['--version', version, filename, '--key', key]);
      expect(result).toMatchSnapshot();

      mock.done();
    });

    it('should update an existing API definition in ReadMe', async () => {
      prompts.inject([true]);

      const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/versions/${version}/apis`)
        .reply(200, { data: [{ filename: slugifiedFilename }] })
        .put(`/versions/1.0.0/apis/${slugifiedFilename}`, body =>
          body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
        )
        .reply(200, {
          data: {
            upload: { status: 'done' },
            uri: `/versions/${version}/apis/${slugifiedFilename}`,
          },
        });

      const result = await run(['--version', version, filename, '--key', key]);
      expect(result).toMatchSnapshot();

      mock.done();
    });

    it('should handle upload failures', async () => {
      const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/versions/${version}/apis`)
        .reply(200, { data: [] })
        .post(`/versions/${version}/apis`, body =>
          body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
        )
        .reply(200, {
          data: {
            upload: { status: 'fail' },
            uri: `/versions/${version}/apis/${slugifiedFilename}`,
          },
        });

      const result = await run(['--version', version, filename, '--key', key]);
      expect(result).toMatchSnapshot();

      mock.done();
    });

    describe('and the `--slug` flag is passed', () => {
      it('should use the provided slug (no file extension) as the filename', async () => {
        const customSlug = 'custom-slug';
        const customSlugWithExtension = `${customSlug}.json`;
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/versions/${version}/apis`)
          .reply(200, { data: [] })
          .post(`/versions/${version}/apis`, body =>
            body.match(`form-data; name="schema"; filename="${customSlugWithExtension}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/versions/${version}/apis/${customSlugWithExtension}`,
            },
          });

        const result = await run(['--version', version, filename, '--key', key, '--slug', customSlug]);
        expect(result).toMatchSnapshot();

        mock.done();
      });

      it('should use the provided slug (includes file extension) as the filename', async () => {
        const customSlug = 'custom-slug.json';
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/versions/${version}/apis`)
          .reply(200, { data: [] })
          .post(`/versions/${version}/apis`, body => body.match(`form-data; name="schema"; filename="${customSlug}"`))
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/versions/${version}/apis/${customSlug}`,
            },
          });

        const result = await run(['--version', version, filename, '--key', key, '--slug', customSlug]);
        expect(result).toMatchSnapshot();

        mock.done();
      });

      it('should handle a slug with an invalid file extension', async () => {
        const customSlug = 'custom-slug.yikes';

        const result = await run(['--version', version, filename, '--key', key, '--slug', customSlug]);
        expect(result).toMatchSnapshot();
      });

      it('should handle a slug with a valid but mismatching file extension', async () => {
        const customSlug = 'custom-slug.yml';

        const result = await run(['--version', version, filename, '--key', key, '--slug', customSlug]);
        expect(result).toMatchSnapshot();
      });
    });

    describe('and the upload status initially is a pending state', () => {
      it('should poll the API until the upload is complete', async () => {
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/versions/${version}/apis`)
          .reply(200, { data: [] })
          .post(`/versions/${version}/apis`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'pending' },
              uri: `/versions/${version}/apis/${slugifiedFilename}`,
            },
          })
          .get(`/versions/${version}/apis/${slugifiedFilename}`)
          .times(9)
          .reply(200, {
            data: {
              upload: { status: 'pending' },
              uri: `/versions/${version}/apis/${slugifiedFilename}`,
            },
          })
          .get(`/versions/${version}/apis/${slugifiedFilename}`)
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/versions/${version}/apis/${slugifiedFilename}`,
            },
          });

        const result = await run(['--version', version, filename, '--key', key]);
        expect(result).toMatchSnapshot();
        mock.done();
      });

      it('should poll the API and handle timeouts', async () => {
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/versions/${version}/apis`)
          .reply(200, { data: [] })
          .post(`/versions/${version}/apis`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'pending' },
              uri: `/versions/${version}/apis/${slugifiedFilename}`,
            },
          })
          .get(`/versions/${version}/apis/${slugifiedFilename}`)
          .times(10)
          .reply(200, {
            data: {
              upload: { status: 'pending' },
              uri: `/versions/${version}/apis/${slugifiedFilename}`,
            },
          });

        const result = await run(['--version', version, filename, '--key', key]);
        expect(result).toMatchSnapshot();
        mock.done();
      });

      it('should poll the API once and handle a failure state with a 4xx', async () => {
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/versions/${version}/apis`)
          .reply(200, { data: [] })
          .post(`/versions/${version}/apis`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'pending' },
              uri: `/versions/${version}/apis/${slugifiedFilename}`,
            },
          })
          .get(`/versions/${version}/apis/${slugifiedFilename}`)
          .reply(400);

        const result = await run(['--version', version, filename, '--key', key]);
        expect(result).toMatchSnapshot();
        mock.done();
      });

      it('should poll the API once and handle an unexpected state with a 2xx', async () => {
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/versions/${version}/apis`)
          .reply(200, { data: [] })
          .post(`/versions/${version}/apis`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'pending' },
              uri: `/versions/${version}/apis/${slugifiedFilename}`,
            },
          })
          .get(`/versions/${version}/apis/${slugifiedFilename}`)
          .reply(200, {
            data: {
              upload: { status: 'something-unexpected' },
              uri: `/versions/${version}/apis/${slugifiedFilename}`,
            },
          });

        const result = await run(['--version', version, filename, '--key', key]);
        expect(result).toMatchSnapshot();
        mock.done();
      });
    });

    describe('and the command is being run in a CI environment', () => {
      beforeEach(before);

      afterEach(after);

      it('should overwrite an existing API definition without asking for confirmation', async () => {
        const mock = getAPIv2MockForGHA({ authorization: `Bearer ${key}` })
          .get(`/versions/${version}/apis`)
          .reply(200, { data: [{ filename: slugifiedFilename }] })
          .put(`/versions/1.0.0/apis/${slugifiedFilename}`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/versions/${version}/apis/${slugifiedFilename}`,
            },
          });

        const result = await run(['--version', version, filename, '--key', key]);
        expect(result).toMatchSnapshot();
        mock.done();
      });
    });

    describe('given that the `--version` flag is not set', () => {
      it('should default to the `stable` version', async () => {
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get('/versions/stable/apis')
          .reply(200, { data: [] })
          .post('/versions/stable/apis', body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/versions/stable/apis/${slugifiedFilename}`,
            },
          });

        const result = await run([filename, '--key', key]);
        expect(result).toMatchSnapshot();
        mock.done();
      });

      it('should use the version from the spec file if --`useSpecVersion` is passed', async () => {
        const altVersion = '1.2.3';
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/versions/${altVersion}/apis`)
          .reply(200, { data: [] })
          .post(`/versions/${altVersion}/apis`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/versions/${altVersion}/apis/${slugifiedFilename}`,
            },
          });

        const result = await run(['--useSpecVersion', filename, '--key', key]);
        expect(result).toMatchSnapshot();
        mock.done();
      });
    });
  });

  describe('given that the API definition is a URL', () => {
    it('should create a new API definition in ReadMe', async () => {
      const fileMock = nock('https://example.com').get('/openapi.json').reply(200, petstore);

      const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/versions/${version}/apis`)
        .reply(200, {})
        .post(`/versions/${version}/apis`, body => body.match(`form-data; name="url"\r\n\r\n${fileUrl}`))
        .reply(200, {
          data: {
            upload: { status: 'done' },
            uri: `/versions/${version}/apis/openapi.json`,
          },
        });

      const result = await run(['--version', version, fileUrl, '--key', key]);
      expect(result).toMatchSnapshot();
      fileMock.done();
      mock.done();
    });

    it('should update an existing API definition in ReadMe', async () => {
      prompts.inject([true]);

      const fileMock = nock('https://example.com').get('/openapi.json').reply(200, petstore);

      const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/versions/${version}/apis`)
        .reply(200, { data: [{ filename: 'openapi.json' }] })
        .put('/versions/1.0.0/apis/openapi.json', body => body.match(`form-data; name="url"\r\n\r\n${fileUrl}`))
        .reply(200, {
          data: {
            upload: { status: 'done' },
            uri: `/versions/${version}/apis/openapi.json`,
          },
        });

      const result = await run(['--version', version, fileUrl, '--key', key]);
      expect(result).toMatchSnapshot();
      fileMock.done();
      mock.done();
    });

    it('should handle issues fetching from the URL', async () => {
      const fileMock = nock('https://example.com').get('/openapi.json').reply(400, {});

      const result = await run(['--version', version, fileUrl, '--key', key]);
      expect(result).toMatchSnapshot();
      fileMock.done();
    });
  });
});
