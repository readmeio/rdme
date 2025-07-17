import nock from 'nock';
import prompts from 'prompts';
import slugify from 'slugify';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import Command from '../../../src/commands/openapi/upload.js';
import petstore from '../../__fixtures__/petstore-simple-weird-version.json' with { type: 'json' };
import { getAPIv2Mock, getAPIv2MockForGHA } from '../../helpers/get-api-mock.js';
import { githubActionsEnv } from '../../helpers/git-mock.js';
import { type OclifOutput, runCommand } from '../../helpers/oclif.js';

const key = 'rdme_123';
const branch = '1.0.0';
const filename = '__tests__/__fixtures__/petstore-simple-weird-version.json';
const yamlFile = '__tests__/__fixtures__/postman/petstore.collection.yaml';
const fileUrl = 'https://example.com/openapi.json';
const slugifiedFilename = slugify.default(filename);
const slugifiedYamlFile = slugify.default(yamlFile);

describe('rdme openapi upload', () => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(Command);
  });

  describe('flag error handling', () => {
    it('should throw if an error if both `--branch` and `--useSpecVersion` flags are passed', async () => {
      const result = await run(['--useSpecVersion', '--branch', branch, filename, '--key', key]);

      expect(result).toMatchSnapshot();
    });

    it('should throw if an error if both `--slug` and `--legacy-id` flags are passed', async () => {
      const customSlug = 'custom-slug';
      const legacyId = '1234567890';
      const result = await run(['--slug', customSlug, '--legacy-id', legacyId, filename, '--key', key]);

      expect(result).toMatchSnapshot();
    });
  });

  describe('given that the API definition is a local file', () => {
    it('should create a new JSON API definition in ReadMe', async () => {
      const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/branches/${branch}/apis`)
        .reply(200, { data: [] })
        .post(`/branches/${branch}/apis`, body =>
          body.match(`form-data; name="schema"; filename="${slugifiedFilename}"\r\nContent-Type: application/json`),
        )
        .reply(200, {
          data: {
            upload: { status: 'done' },
            uri: `/branches/${branch}/apis/${slugifiedFilename}`,
          },
        });

      const result = await run(['--branch', branch, filename, '--key', key]);

      expect(result).toMatchSnapshot();

      mock.done();
    });

    it('should create a new JSON API definition in ReadMe with deprecated `--version` flag', async () => {
      const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/branches/${branch}/apis`)
        .reply(200, { data: [] })
        .post(`/branches/${branch}/apis`, body =>
          body.match(`form-data; name="schema"; filename="${slugifiedFilename}"\r\nContent-Type: application/json`),
        )
        .reply(200, {
          data: {
            upload: { status: 'done' },
            uri: `/branches/${branch}/apis/${slugifiedFilename}`,
          },
        });

      const result = await run(['--version', branch, filename, '--key', key]);

      expect(result).toMatchSnapshot();

      mock.done();
    });

    it('should create a new YAML API definition in ReadMe', async () => {
      const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/branches/${branch}/apis`)
        .reply(200, { data: [] })
        .post(`/branches/${branch}/apis`, body =>
          body.match(`form-data; name="schema"; filename="${slugifiedYamlFile}"\r\nContent-Type: application/x-yaml`),
        )
        .reply(200, {
          data: {
            upload: { status: 'done' },
            uri: `/branches/${branch}/apis/${slugifiedYamlFile}`,
          },
        });

      const result = await run(['--branch', branch, yamlFile, '--key', key]);

      expect(result).toMatchSnapshot();

      mock.done();
    });

    it('should update an existing API definition in ReadMe', async () => {
      prompts.inject([true]);

      const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/branches/${branch}/apis`)
        .reply(200, { data: [{ filename: slugifiedFilename }] })
        .put(`/branches/1.0.0/apis/${slugifiedFilename}`, body =>
          body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
        )
        .reply(200, {
          data: {
            upload: { status: 'done' },
            uri: `/branches/${branch}/apis/${slugifiedFilename}`,
          },
        });

      const result = await run(['--branch', branch, filename, '--key', key]);

      expect(result).toMatchSnapshot();

      mock.done();
    });

    it('should handle upload failures', async () => {
      const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/branches/${branch}/apis`)
        .reply(200, { data: [] })
        .post(`/branches/${branch}/apis`, body =>
          body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
        )
        .reply(200, {
          data: {
            upload: { status: 'fail' },
            uri: `/branches/${branch}/apis/${slugifiedFilename}`,
          },
        });

      const result = await run(['--branch', branch, filename, '--key', key]);

      expect(result).toMatchSnapshot();

      mock.done();
    });

    describe('and the `--slug` flag is passed', () => {
      it('should use the provided slug (no file extension) as the filename', async () => {
        const customSlug = 'custom-slug';
        const customSlugWithExtension = `${customSlug}.json`;
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/branches/${branch}/apis`)
          .reply(200, { data: [] })
          .post(`/branches/${branch}/apis`, body =>
            body.match(`form-data; name="schema"; filename="${customSlugWithExtension}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/branches/${branch}/apis/${customSlugWithExtension}`,
            },
          });

        const result = await run(['--branch', branch, filename, '--key', key, '--slug', customSlug]);

        expect(result).toMatchSnapshot();

        mock.done();
      });

      it('should use the provided slug (includes file extension) as the filename', async () => {
        const customSlug = 'custom-slug.json';
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/branches/${branch}/apis`)
          .reply(200, { data: [] })
          .post(`/branches/${branch}/apis`, body => body.match(`form-data; name="schema"; filename="${customSlug}"`))
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/branches/${branch}/apis/${customSlug}`,
            },
          });

        const result = await run(['--branch', branch, filename, '--key', key, '--slug', customSlug]);

        expect(result).toMatchSnapshot();

        mock.done();
      });

      it('should handle a slug with an invalid file extension', async () => {
        const customSlug = 'custom-slug.yikes';

        const result = await run(['--branch', branch, filename, '--key', key, '--slug', customSlug]);

        expect(result).toMatchSnapshot();
      });

      it('should handle a slug with a valid but mismatching file extension', async () => {
        const customSlug = 'custom-slug.yml';

        const result = await run(['--branch', branch, filename, '--key', key, '--slug', customSlug]);

        expect(result).toMatchSnapshot();
      });
    });

    describe('and the upload status initially is a pending state', () => {
      it('should poll the API until the upload is complete', async () => {
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/branches/${branch}/apis`)
          .reply(200, { data: [] })
          .post(`/branches/${branch}/apis`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'pending' },
              uri: `/branches/${branch}/apis/${slugifiedFilename}`,
            },
          })
          .get(`/branches/${branch}/apis/${slugifiedFilename}`)
          .times(9)
          .reply(200, {
            data: {
              upload: { status: 'pending' },
              uri: `/branches/${branch}/apis/${slugifiedFilename}`,
            },
          })
          .get(`/branches/${branch}/apis/${slugifiedFilename}`)
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/branches/${branch}/apis/${slugifiedFilename}`,
            },
          });

        const result = await run(['--branch', branch, filename, '--key', key]);

        expect(result).toMatchSnapshot();

        mock.done();
      });

      it('should poll the API until the update is complete', async () => {
        prompts.inject([true]);

        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/branches/${branch}/apis`)
          .reply(200, { data: [{ filename: slugifiedFilename }] })
          .put(`/branches/1.0.0/apis/${slugifiedFilename}`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'pending_update' },
              uri: `/branches/${branch}/apis/${slugifiedFilename}`,
            },
          })
          .get(`/branches/${branch}/apis/${slugifiedFilename}`)
          .times(4)
          .reply(200, {
            data: {
              upload: { status: 'pending_update' },
              uri: `/branches/${branch}/apis/${slugifiedFilename}`,
            },
          })
          .get(`/branches/${branch}/apis/${slugifiedFilename}`)
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/branches/${branch}/apis/${slugifiedFilename}`,
            },
          });

        const result = await run(['--branch', branch, filename, '--key', key]);

        expect(result).toMatchSnapshot();

        mock.done();
      });

      it('should poll the API and handle timeouts', async () => {
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/branches/${branch}/apis`)
          .reply(200, { data: [] })
          .post(`/branches/${branch}/apis`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'pending' },
              uri: `/branches/${branch}/apis/${slugifiedFilename}`,
            },
          })
          .get(`/branches/${branch}/apis/${slugifiedFilename}`)
          .times(10)
          .reply(200, {
            data: {
              upload: { status: 'pending' },
              uri: `/branches/${branch}/apis/${slugifiedFilename}`,
            },
          });

        const result = await run(['--branch', branch, filename, '--key', key]);

        expect(result).toMatchSnapshot();

        mock.done();
      });

      it('should poll the API once and handle a failure state with a 4xx', async () => {
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/branches/${branch}/apis`)
          .reply(200, { data: [] })
          .post(`/branches/${branch}/apis`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'pending' },
              uri: `/branches/${branch}/apis/${slugifiedFilename}`,
            },
          })
          .get(`/branches/${branch}/apis/${slugifiedFilename}`)
          .reply(400);

        const result = await run(['--branch', branch, filename, '--key', key]);

        expect(result).toMatchSnapshot();

        mock.done();
      });

      it('should poll the API once and handle an unexpected state with a 2xx', async () => {
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/branches/${branch}/apis`)
          .reply(200, { data: [] })
          .post(`/branches/${branch}/apis`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'pending' },
              uri: `/branches/${branch}/apis/${slugifiedFilename}`,
            },
          })
          .get(`/branches/${branch}/apis/${slugifiedFilename}`)
          .reply(200, {
            data: {
              upload: { status: 'something-unexpected' },
              uri: `/branches/${branch}/apis/${slugifiedFilename}`,
            },
          });

        const result = await run(['--branch', branch, filename, '--key', key]);

        expect(result).toMatchSnapshot();

        mock.done();
      });
    });

    describe('and the command is being run in a CI environment', () => {
      beforeEach(githubActionsEnv.before);

      afterEach(githubActionsEnv.after);

      it('should overwrite an existing API definition without asking for confirmation', async () => {
        const mock = getAPIv2MockForGHA({ authorization: `Bearer ${key}` })
          .get(`/branches/${branch}/apis`)
          .reply(200, { data: [{ filename: slugifiedFilename }] })
          .put(`/branches/1.0.0/apis/${slugifiedFilename}`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/branches/${branch}/apis/${slugifiedFilename}`,
            },
          });

        const result = await run(['--branch', branch, filename, '--key', key]);

        expect(result).toMatchSnapshot();

        mock.done();
      });
    });

    describe('given that the `--branch` flag is not set', () => {
      it('should default to the `stable` version', async () => {
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get('/branches/stable/apis')
          .reply(200, { data: [] })
          .post('/branches/stable/apis', body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/branches/stable/apis/${slugifiedFilename}`,
            },
          });

        const result = await run([filename, '--key', key]);

        expect(result).toMatchSnapshot();

        mock.done();
      });

      it('should use the version from the spec file if --`useSpecVersion` is passed', async () => {
        const altVersion = '1.2.3';
        const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
          .get(`/branches/${altVersion}/apis`)
          .reply(200, { data: [] })
          .post(`/branches/${altVersion}/apis`, body =>
            body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
          )
          .reply(200, {
            data: {
              upload: { status: 'done' },
              uri: `/branches/${altVersion}/apis/${slugifiedFilename}`,
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
        .get(`/branches/${branch}/apis`)
        .reply(200, {})
        .post(`/branches/${branch}/apis`, body => body.match(`form-data; name="url"\r\n\r\n${fileUrl}`))
        .reply(200, {
          data: {
            upload: { status: 'done' },
            uri: `/branches/${branch}/apis/openapi.json`,
          },
        });

      const result = await run(['--branch', branch, fileUrl, '--key', key]);

      expect(result).toMatchSnapshot();

      fileMock.done();
      mock.done();
    });

    it('should update an existing API definition in ReadMe', async () => {
      prompts.inject([true]);

      const fileMock = nock('https://example.com').get('/openapi.json').reply(200, petstore);

      const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/branches/${branch}/apis`)
        .reply(200, { data: [{ filename: 'openapi.json' }] })
        .put('/branches/1.0.0/apis/openapi.json', body => body.match(`form-data; name="url"\r\n\r\n${fileUrl}`))
        .reply(200, {
          data: {
            upload: { status: 'done' },
            uri: `/branches/${branch}/apis/openapi.json`,
          },
        });

      const result = await run(['--branch', branch, fileUrl, '--key', key]);

      expect(result).toMatchSnapshot();

      fileMock.done();
      mock.done();
    });

    it('should handle issues fetching from the URL', async () => {
      const fileMock = nock('https://example.com').get('/openapi.json').reply(400, {});

      const result = await run(['--branch', branch, fileUrl, '--key', key]);

      expect(result).toMatchSnapshot();

      fileMock.done();
    });
  });

  describe('given that the confirm overwrite flag is passed', () => {
    it('should overwrite an existing API definition without asking for confirmation', async () => {
      const mock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/branches/${branch}/apis`)
        .reply(200, { data: [{ filename: slugifiedFilename }] })
        .put(`/branches/${branch}/apis/${slugifiedFilename}`, body =>
          body.match(`form-data; name="schema"; filename="${slugifiedFilename}"`),
        )
        .reply(200, {
          data: {
            upload: { status: 'done' },
            uri: `/branches/${branch}/apis/${slugifiedFilename}`,
          },
        });

      const result = await run(['--branch', branch, filename, '--key', key, '--confirm-overwrite']);

      expect(result.stdout).toContain('was successfully updated in ReadMe!');

      mock.done();
    });
  });

  describe('given that the "--legacy-id" flag is passed', () => {
    it('should update an existing spec with matching legacy_id', async () => {
      const legacyId = '1234567890';
      const existingFilename = 'legacy-spec.json';
      prompts.inject([true]);
      const getMock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/branches/${branch}/apis`)
        .reply(200, { data: [{ legacy_id: legacyId, filename: existingFilename }] });

      const putMock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .put(`/branches/${branch}/apis/${existingFilename}`, body =>
          body.match(`form-data; name="schema"; filename="${existingFilename}"`),
        )
        .reply(200, {
          data: {
            upload: { status: 'done' },
            uri: `/branches/${branch}/apis/${existingFilename}`,
          },
        });

      const result = await run(['--branch', branch, filename, '--key', key, '--legacy-id', legacyId]);

      expect(result).toMatchSnapshot();

      getMock.done();
      putMock.done();
    });

    it('should error if no matching API definition found (and there are no existing definitions)', async () => {
      const legacyId = '1234567890';
      prompts.inject([true]);
      const getMock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/branches/${branch}/apis`)
        .reply(200, { data: [] });

      const result = await run(['--branch', branch, filename, '--key', key, '--legacy-id', legacyId]);

      expect(result).toMatchSnapshot();

      getMock.done();
    });

    it('should error if no matching API definition found (and there are existing definitions)', async () => {
      const legacyId = '1234567890';
      prompts.inject([true]);
      const getMock = getAPIv2Mock({ authorization: `Bearer ${key}` })
        .get(`/branches/${branch}/apis`)
        .reply(200, { data: [{ legacy_id: 'some-mismatching-id' }] });

      const result = await run(['--branch', branch, filename, '--key', key, '--legacy-id', legacyId]);

      expect(result).toMatchSnapshot();

      getMock.done();
    });
  });
});
