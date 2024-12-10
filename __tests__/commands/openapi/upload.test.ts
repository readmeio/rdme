import nock from 'nock';
import prompts from 'prompts';
import slugify from 'slugify';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi } from 'vitest';

import Command from '../../../src/commands/openapi/upload.js';
import petstore from '../../__fixtures__/petstore-simple-weird-version.json' with { type: 'json' };
import { getAPIv2Mock } from '../../helpers/get-api-mock.js';
import { runCommand, type OclifOutput } from '../../helpers/oclif.js';

const key = 'rdme_123';
const version = '1.0.0';
const filename = '__tests__/__fixtures__/petstore-simple-weird-version.json';
const fileUrl = 'https://example.com/openapi.json';
const slugifiedFilename = slugify.default(filename);

describe('rdme openapi upload', () => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    nock.disableNetConnect();
    run = runCommand(Command);
  });

  afterEach(() => {
    nock.cleanAll();
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
      expect(result.stdout).toContain('was successfully created in ReadMe!');

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
      expect(result.stdout).toContain('was successfully updated in ReadMe!');

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
      expect(result.error.message).toBe(
        'Your API definition upload failed with an unexpected error. Please get in touch with us at support@readme.io.',
      );

      mock.done();
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
        expect(result.stdout).toContain('was successfully created in ReadMe!');

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
        expect(result.error.message).toBe('Sorry, this upload timed out. Please try again later.');

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
        expect(result.error.message).toBe(
          'The ReadMe API responded with an unexpected error. Please try again and if this issue persists, get in touch with us at support@readme.io.',
        );

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
        expect(result.error).toStrictEqual(
          new Error(
            'Your API definition upload failed with an unexpected error. Please get in touch with us at support@readme.io.',
          ),
        );

        mock.done();
      });
    });

    describe('and the command is being run in a CI environment', () => {
      beforeEach(() => {
        vi.stubEnv('TEST_RDME_CI', 'true');
      });

      afterEach(() => {
        vi.unstubAllEnvs();
      });

      it('should overwrite an existing API definition without asking for confirmation', async () => {
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
        expect(result.stdout).toContain('was successfully updated in ReadMe!');

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
      expect(result.stdout).toContain('was successfully created in ReadMe!');

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
      expect(result.stdout).toContain('was successfully updated in ReadMe!');

      fileMock.done();
      mock.done();
    });

    it('should handle issues fetching from the URL', async () => {
      const fileMock = nock('https://example.com').get('/openapi.json').reply(400, {});

      const result = await run(['--version', version, fileUrl, '--key', key]);
      expect(result.error.message).toBe('Unknown file detected.');

      fileMock.done();
    });
  });
});
