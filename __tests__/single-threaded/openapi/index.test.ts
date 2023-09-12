/* eslint-disable no-console */
import fs from 'fs';

import chalk from 'chalk';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import prompts from 'prompts';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi, afterAll } from 'vitest';

import OpenAPICommand from '../../../src/cmds/openapi';
import config from '../../../src/lib/config';
import { getAPIMockMSW } from '../../helpers/get-api-mock';
import { after, before } from '../../helpers/get-gha-setup';
import { after as afterGHAEnv, before as beforeGHAEnv } from '../../helpers/setup-gha-env';

const openapi = new OpenAPICommand();

let consoleInfoSpy;
let consoleWarnSpy;

const key = 'API_KEY';
const version = '1.0.0';
const exampleRefLocation = `${config.host}/project/example-project/1.0.1/refs/ex`;
const successfulMessageBase = (specPath, specType) => [
  '',
  `\t${chalk.green(exampleRefLocation)}`,
  '',
  `To update your ${specType} definition, run the following:`,
  '',
  `\t${chalk.green(`rdme openapi ${specPath} --key=<key> --id=1`)}`,
];
const successfulUpload = (specPath, specType = 'OpenAPI') =>
  [
    `You've successfully uploaded a new ${specType} file to your ReadMe project!`,
    ...successfulMessageBase(specPath, specType),
  ].join('\n');

const getCommandOutput = () => {
  return [consoleWarnSpy.mock.calls.join('\n\n'), consoleInfoSpy.mock.calls.join('\n\n')].filter(Boolean).join('\n\n');
};

const getRandomRegistryId = () => Math.random().toString(36).substring(2);

const server = setupServer(...[]);

describe('rdme openapi (single-threaded)', () => {
  let testWorkingDir: string;

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    testWorkingDir = process.cwd();
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();

    server.resetHandlers();

    process.chdir(testWorkingDir);
  });

  afterAll(() => server.close());

  describe('upload', () => {
    it('should discover and upload an API definition if none is provided', async () => {
      expect.assertions(6);
      const registryUUID = getRandomRegistryId();

      server.use(
        ...[
          getAPIMockMSW(`/api/v1/version/${version}`, 200, { json: { version } }, key),
          rest.post(`${config.host}/api/v1/api-registry`, async (req, res, ctx) => {
            const body = await req.text();
            expect(body).toMatch('form-data; name="spec"');
            return res(ctx.status(201), ctx.json({ registryUUID, spec: { openapi: '3.0.0' } }));
          }),
          getAPIMockMSW('/api/v1/api-specification', 200, { json: [] }, key, { 'x-readme-version': version }),
          rest.post(`${config.host}/api/v1/api-specification`, async (req, res, ctx) => {
            const body = await req.json();
            expect(body).toStrictEqual({ registryUUID });
            expect(req.headers.get('authorization')).toBeBasicAuthApiKey(key);
            return res(ctx.status(201), ctx.set('location', exampleRefLocation), ctx.json({ _id: 1 }));
          }),
        ],
      );

      const spec = 'petstore.json';

      await expect(
        openapi.run({
          key,
          version,
          workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
        }),
      ).resolves.toBe(successfulUpload(spec));

      expect(console.info).toHaveBeenCalledTimes(1);

      const output = getCommandOutput();
      return expect(output).toBe(chalk.yellow(`ℹ️  We found ${spec} and are attempting to upload it.`));
    });

    it('should use specified working directory and upload the expected content', async () => {
      expect.assertions(6);
      let requestBody;
      const registryUUID = getRandomRegistryId();

      server.use(
        ...[
          getAPIMockMSW(`/api/v1/version/${version}`, 200, { json: { version } }, key),
          rest.post(`${config.host}/api/v1/api-registry`, async (req, res, ctx) => {
            const body = await req.text();
            requestBody = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1);
            requestBody = JSON.parse(requestBody);
            expect(body).toMatch('form-data; name="spec"');
            return res(ctx.status(201), ctx.json({ registryUUID, spec: { openapi: '3.0.0' } }));
          }),
          getAPIMockMSW('/api/v1/api-specification', 200, { json: [] }, key, { 'x-readme-version': version }),
          rest.post(`${config.host}/api/v1/api-specification`, async (req, res, ctx) => {
            const body = await req.json();
            expect(body).toStrictEqual({ registryUUID });
            expect(req.headers.get('authorization')).toBeBasicAuthApiKey(key);
            return res(ctx.status(201), ctx.set('location', exampleRefLocation), ctx.json({ _id: 1 }));
          }),
        ],
      );

      const spec = 'petstore.json';

      await expect(
        openapi.run({
          spec,
          key,
          version,
          workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
        }),
      ).resolves.toBe(successfulUpload(spec));

      expect(console.info).toHaveBeenCalledTimes(0);

      return expect(requestBody).toMatchSnapshot();
    });

    it('should return spec create info for dry run', async () => {
      expect.assertions(3);
      const registryUUID = getRandomRegistryId();

      server.use(
        ...[
          getAPIMockMSW(`/api/v1/version/${version}`, 200, { json: { version } }, key),
          rest.post(`${config.host}/api/v1/api-registry`, async (req, res, ctx) => {
            const body = await req.text();
            expect(body).toMatch('form-data; name="spec"');
            return res(ctx.status(201), ctx.json({ registryUUID, spec: { openapi: '3.0.0' } }));
          }),
          getAPIMockMSW('/api/v1/api-specification', 200, { json: [] }, key, { 'x-readme-version': version }),
        ],
      );

      await expect(
        openapi.run({
          key,
          version,
          dryRun: true,
          workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
        }),
      ).resolves.toMatch(
        '🎭 dry run! The API Definition located at petstore.json will be created for this project version: 1.0.0',
      );

      const output = getCommandOutput();
      return expect(output).toMatch(
        chalk.yellow('🎭 dry run option detected! No API definitions will be created or updated in ReadMe.'),
      );
    });
  });

  describe('error handling', () => {
    it.only('should error if no file was provided or able to be discovered', () => {
      return expect(openapi.run({ key, version, workingDirectory: 'bin' })).rejects.toStrictEqual(
        new Error(
          "We couldn't find an OpenAPI or Swagger definition.\n\nPlease specify the path to your definition with `rdme openapi ./path/to/api/definition`.",
        ),
      );
    });
  });

  describe('GHA onboarding E2E tests', () => {
    let yamlOutput;

    beforeEach(() => {
      before((fileName, data) => {
        yamlOutput = data;
      });
    });

    afterEach(() => {
      after();
    });

    it('should create GHA workflow (including workingDirectory)', async () => {
      expect.assertions(7);
      const yamlFileName = 'openapi-file-workingdirectory';
      prompts.inject([true, 'openapi-branch-workingdirectory', yamlFileName]);
      const registryUUID = getRandomRegistryId();

      server.use(
        ...[
          getAPIMockMSW(`/api/v1/version/${version}`, 200, { json: { version } }, key),
          rest.post(`${config.host}/api/v1/api-registry`, async (req, res, ctx) => {
            const body = await req.text();
            expect(body).toMatch('form-data; name="spec"');
            return res(ctx.status(201), ctx.json({ registryUUID, spec: { openapi: '3.0.0' } }));
          }),
          getAPIMockMSW('/api/v1/api-specification', 200, { json: [] }, key, { 'x-readme-version': version }),
          rest.post(`${config.host}/api/v1/api-specification`, async (req, res, ctx) => {
            expect(req.headers.get('authorization')).toBeBasicAuthApiKey(key);
            const body = await req.json();
            expect(body).toStrictEqual({ registryUUID });
            return res(ctx.status(201), ctx.set('location', exampleRefLocation), ctx.json({ _id: 1 }));
          }),
        ],
      );

      const spec = 'petstore.json';

      await expect(
        openapi.run({
          spec,
          key,
          version,
          workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
        }),
      ).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
      return expect(fs.writeFileSync).toHaveBeenNthCalledWith(
        2,
        `.github/workflows/${yamlFileName}.yml`,
        expect.any(String),
      );
    });
  });

  describe('command execution in GitHub Actions runner', () => {
    beforeEach(() => {
      beforeGHAEnv();
    });

    afterEach(afterGHAEnv);

    it('should contain request header with correct URL with working directory', async () => {
      expect.assertions(8);
      const registryUUID = getRandomRegistryId();
      server.use(
        ...[
          getAPIMockMSW(`/api/v1/version/${version}`, 200, { json: { version } }, key),
          rest.post(`${config.host}/api/v1/api-registry`, async (req, res, ctx) => {
            const body = await req.text();
            expect(body).toMatch('form-data; name="spec"');
            return res(ctx.status(201), ctx.json({ registryUUID, spec: { openapi: '3.0.0' } }));
          }),
          getAPIMockMSW('/api/v1/api-specification', 200, { json: [] }, key, { 'x-readme-version': version }),
          rest.post(`${config.host}/api/v1/api-specification`, async (req, res, ctx) => {
            expect(req.headers.get('authorization')).toBeBasicAuthApiKey(key);
            expect(req.headers.get('x-rdme-ci')).toBe('GitHub Actions (test)');
            expect(req.headers.get('x-readme-source')).toBe('cli-gh');
            expect(req.headers.get('x-readme-source-url')).toBe(
              'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/relative-ref-oas/petstore.json',
            );
            expect(req.headers.get('x-readme-version')).toBe(version);
            const body = await req.json();
            expect(body).toStrictEqual({ registryUUID });
            return res(ctx.status(201), ctx.set('location', exampleRefLocation), ctx.json({ _id: 1 }));
          }),
        ],
      );

      const spec = 'petstore.json';

      await expect(
        openapi.run({
          spec,
          key,
          version,
          workingDirectory: './__tests__/__fixtures__/relative-ref-oas',
        }),
      ).resolves.toBe(successfulUpload(spec));

      return after();
    });
  });
});
