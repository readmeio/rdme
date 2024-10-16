/* eslint-disable no-console */
import type { Config } from '@oclif/core';

import fs from 'node:fs';

import chalk from 'chalk';
import nock from 'nock';
import prompts from 'prompts';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi } from 'vitest';

import config from '../../../src/lib/config.js';
import getAPIMock, { getAPIMockWithVersionHeader } from '../../helpers/get-api-mock.js';
import { after, before } from '../../helpers/get-gha-setup.js';
import { after as afterGHAEnv, before as beforeGHAEnv } from '../../helpers/setup-gha-env.js';
import setupOclifConfig from '../../helpers/setup-oclif-config.js';

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

describe('rdme openapi (single-threaded)', () => {
  let oclifConfig: Config;
  let run: (args?: string[]) => Promise<unknown>;
  let testWorkingDir: string;

  beforeAll(() => {
    nock.disableNetConnect();
  });

  beforeEach(async () => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    oclifConfig = await setupOclifConfig();
    run = (args?: string[]) => oclifConfig.runCommand('openapi', args);
    testWorkingDir = process.cwd();
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();

    process.chdir(testWorkingDir);

    nock.cleanAll();
  });

  describe('upload', () => {
    it('should discover and upload an API definition if none is provided', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => {
          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      const postMock = getAPIMockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = 'petstore.json';

      await expect(
        run(['--key', key, '--version', version, '--workingDirectory', './__tests__/__fixtures__/relative-ref-oas']),
      ).resolves.toBe(successfulUpload(spec));

      expect(console.info).toHaveBeenCalledTimes(1);

      const output = getCommandOutput();
      expect(output).toBe(chalk.yellow(`ℹ️  We found ${spec} and are attempting to upload it.`));

      postMock.done();
      return mock.done();
    });

    it('should use specified working directory and upload the expected content', async () => {
      let requestBody;
      const registryUUID = getRandomRegistryId();

      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => {
          requestBody = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1);
          requestBody = JSON.parse(requestBody);

          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      const postMock = getAPIMockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = 'petstore.json';

      await expect(
        run([
          spec,
          '--key',
          key,
          '--version',
          version,
          '--workingDirectory',
          './__tests__/__fixtures__/relative-ref-oas',
        ]),
      ).resolves.toBe(successfulUpload(spec));

      expect(console.info).toHaveBeenCalledTimes(0);

      expect(requestBody).toMatchSnapshot();

      postMock.done();
      return mock.done();
    });

    it('should return spec create info for dry run', async () => {
      const registryUUID = getRandomRegistryId();

      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => {
          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      await expect(
        run([
          '--key',
          key,
          '--version',
          version,
          '--workingDirectory',
          './__tests__/__fixtures__/relative-ref-oas',
          '--dryRun',
        ]),
      ).resolves.toMatch(
        '🎭 dry run! The API Definition located at petstore.json will be created for this project version: 1.0.0',
      );

      const output = getCommandOutput();
      expect(output).toMatch(
        chalk.yellow('🎭 dry run option detected! No API definitions will be created or updated in ReadMe.'),
      );

      return mock.done();
    });
  });

  describe('error handling', () => {
    it('should error if no file was provided or able to be discovered', () => {
      return expect(run(['--key', key, '--version', version, '--workingDirectory', 'bin'])).rejects.toStrictEqual(
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
      const yamlFileName = 'openapi-file-workingdirectory';
      prompts.inject([true, 'openapi-branch-workingdirectory', yamlFileName]);
      const registryUUID = getRandomRegistryId();

      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => {
          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      const postMock = getAPIMockWithVersionHeader(version)
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = 'petstore.json';

      await expect(
        run([
          spec,
          '--key',
          key,
          '--version',
          version,
          '--workingDirectory',
          './__tests__/__fixtures__/relative-ref-oas',
        ]),
      ).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
      expect(fs.writeFileSync).toHaveBeenNthCalledWith(2, `.github/workflows/${yamlFileName}.yml`, expect.any(String));

      postMock.done();
      return mock.done();
    });
  });

  describe('command execution in GitHub Actions runner', () => {
    beforeEach(() => {
      beforeGHAEnv();
    });

    afterEach(afterGHAEnv);

    it('should contain request header with correct URL with working directory', async () => {
      const registryUUID = getRandomRegistryId();
      const mock = getAPIMock()
        .get(`/api/v1/version/${version}`)
        .basicAuth({ user: key })
        .reply(200, { version })
        .post('/api/v1/api-registry', body => {
          return body.match('form-data; name="spec"');
        })
        .reply(201, { registryUUID, spec: { openapi: '3.0.0' } })
        .get('/api/v1/api-specification')
        .basicAuth({ user: key })
        .reply(200, []);

      const postMock = getAPIMock({
        'x-rdme-ci': 'GitHub Actions (test)',
        'x-readme-source': 'cli-gh',
        'x-readme-source-url':
          'https://github.com/octocat/Hello-World/blob/ffac537e6cbbf934b08745a378932722df287a53/__tests__/__fixtures__/relative-ref-oas/petstore.json',
        'x-readme-version': version,
      })
        .post('/api/v1/api-specification', { registryUUID })
        .basicAuth({ user: key })
        .reply(201, { _id: 1 }, { location: exampleRefLocation });

      const spec = 'petstore.json';

      await expect(
        run([
          spec,
          '--key',
          key,
          '--version',
          version,
          '--workingDirectory',
          './__tests__/__fixtures__/relative-ref-oas',
        ]),
      ).resolves.toBe(successfulUpload(spec));

      after();

      postMock.done();
      return mock.done();
    });
  });
});
