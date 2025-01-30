/* eslint-disable vitest/no-disabled-tests */
/* eslint-disable no-console */
import type { Command, Config } from '@oclif/core';
import type { Response } from 'simple-git';

import fs from 'node:fs';

import prompts from 'prompts';
import { describe, beforeEach, afterEach, it, expect, vi, type MockInstance, beforeAll } from 'vitest';

import configstore from '../../src/lib/configstore.js';
import { getConfigStoreKey, getGHAFileName, git } from '../../src/lib/createGHA/index.js';
import { getMajorPkgVersion } from '../../src/lib/getPkg.js';
import { after, before } from '../helpers/get-gha-setup.js';
import getGitRemoteMock from '../helpers/get-git-mock.js';
import ghaWorkflowSchema from '../helpers/github-workflow-schema.json' with { type: 'json' };
import { setupOclifConfig } from '../helpers/oclif.js';
import { toBeValidSchema } from '../helpers/vitest.matchers.js';

const testWorkingDir = process.cwd();

let consoleInfoSpy: MockInstance<typeof console.info>;
const getCommandOutput = () => consoleInfoSpy.mock.calls.join('\n\n');

const key = 'API_KEY';

describe('#createGHA', () => {
  let oclifConfig: Config;
  let yamlOutput;

  beforeAll(() => {
    expect.extend({ toBeValidSchema });
  });

  beforeEach(async () => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    oclifConfig = await setupOclifConfig();

    before((fileName, data) => {
      yamlOutput = data;
    });
  });

  afterEach(() => {
    after();

    consoleInfoSpy.mockRestore();
    process.chdir(testWorkingDir);
  });

  describe('command inputs', () => {
    describe.each<{
      cmd: string;
      /** used to differentiate describe blocks */
      label: string;
      opts: Record<string, string>;
    }>([
      // `openapi:validate` is the ID we define in src/index.ts for backwards compatibility,
      // hence we're using this command ID here
      { cmd: 'openapi:validate', opts: { spec: 'petstore.json' }, label: '' },
      { cmd: 'openapi', opts: { key, spec: 'petstore.json', id: 'spec_id' }, label: '' },
      { cmd: 'docs', opts: { key, path: './docs', version: '1.0.0' }, label: '' },
      {
        cmd: 'docs',

        label: ' (single)',
        opts: { key, path: './docs/rdme.md', version: '1.0.0' },
      },
      { cmd: 'changelogs', opts: { key, path: './changelogs' }, label: '' },
      {
        cmd: 'changelogs',

        label: ' (single)',
        opts: { key, path: './changelogs/rdme.md' },
      },
      { cmd: 'custompages', opts: { key, path: './custompages' }, label: '' },
      {
        cmd: 'custompages',
        label: ' (single)',
        opts: { key, path: './custompages/rdme.md' },
      },
    ])('$cmd $label', ({ cmd, opts }) => {
      let CurrentCommand: Command.Class;

      beforeEach(async () => {
        const foundCommand = oclifConfig.findCommand(cmd);
        CurrentCommand = await foundCommand.load();
      });

      it('should run GHA creation workflow and generate valid workflow file', async () => {
        expect.assertions(6);
        const fileName = `rdme-${cmd}`;
        prompts.inject([true, 'some-branch', fileName]);

        const res = await oclifConfig.runHook('createGHA', { command: CurrentCommand, parsedOpts: opts, result: '' });
        expect(res.successes[0].result).toMatchSnapshot();

        expect(yamlOutput).toBeValidSchema(ghaWorkflowSchema);
        expect(yamlOutput).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(getGHAFileName(fileName), expect.any(String));
        expect(console.info).toHaveBeenCalledTimes(1);
        const output = getCommandOutput();
        expect(output).toMatch("Looks like you're running this command in a GitHub Repository!");
      });

      it('should run GHA creation workflow with `--github` flag and messy file name and generate valid workflow file', async () => {
        expect.assertions(4);
        const fileName = `rdme-${cmd} with GitHub flag`;
        prompts.inject(['another-branch', fileName]);

        const res = await oclifConfig.runHook('createGHA', {
          command: CurrentCommand,
          parsedOpts: { ...opts, github: true },
          result: '',
        });
        expect(res.successes[0].result).toMatchSnapshot();

        expect(yamlOutput).toBeValidSchema(ghaWorkflowSchema);
        expect(yamlOutput).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(getGHAFileName(fileName), expect.any(String));
      });

      // skipping because these mocks aren't playing nicely with oclif
      it.skip('should create workflow directory if it does not exist', async () => {
        expect.assertions(3);
        const repoRoot = '__tests__/__fixtures__';

        git.revparse = vi.fn(() => {
          return Promise.resolve(repoRoot) as unknown as Response<string>;
        });

        const fileName = `rdme-${cmd}`;
        prompts.inject([true, 'some-branch', fileName]);

        fs.mkdirSync = vi.fn(() => {
          return '';
        });

        const res = await oclifConfig.runHook('createGHA', { command: CurrentCommand, parsedOpts: opts, result: '' });
        expect(res.successes[0].result).toBeTruthy();

        expect(fs.mkdirSync).toHaveBeenCalledWith('.github/workflows', { recursive: true });
        expect(fs.writeFileSync).toHaveBeenCalledWith(getGHAFileName(fileName), expect.any(String));
      });

      it('should run if user is on an outdated package version', async () => {
        const fileName = `rdme-${cmd}`;
        prompts.inject([true, 'some-branch', fileName]);

        const repoRoot = process.cwd();

        configstore.set(getConfigStoreKey(repoRoot), (await getMajorPkgVersion()) - 1);

        const res = await oclifConfig.runHook('createGHA', { command: CurrentCommand, parsedOpts: opts, result: '' });
        return expect(res.successes[0].result).toMatch('Your GitHub Actions workflow file has been created!');
      });

      it('should set config and exit if user does not want to set up GHA', async () => {
        expect.assertions(2);
        prompts.inject([false]);

        const repoRoot = process.cwd();

        git.revparse = vi.fn(() => {
          return Promise.resolve(repoRoot) as unknown as Response<string>;
        });

        const res = await oclifConfig.runHook('createGHA', { command: CurrentCommand, parsedOpts: opts, result: '' });
        expect(res.failures[0].error).toStrictEqual(
          new Error(
            'GitHub Actions workflow creation cancelled. If you ever change your mind, you can run this command again with the `--github` flag.',
          ),
        );

        expect(configstore.get(getConfigStoreKey(repoRoot))).toBe(await getMajorPkgVersion());
      });

      // skipping because these mocks aren't playing nicely with oclif
      it.skip('should not run if not a repo', async () => {
        git.checkIsRepo = vi.fn(() => {
          return Promise.reject(new Error('not a repo')) as unknown as Response<boolean>;
        });

        git.remote = getGitRemoteMock('', '', '');

        const res = await oclifConfig.runHook('createGHA', {
          command: CurrentCommand,
          parsedOpts: opts,
          result: 'success!',
        });

        return expect(res.successes[0].result).toBe('success!');
      });

      // skipping because these mocks aren't playing nicely with oclif
      it.skip('should not run if a repo with no remote', async () => {
        git.remote = getGitRemoteMock('', '', '');

        const res = await oclifConfig.runHook('createGHA', {
          command: CurrentCommand,
          parsedOpts: opts,
          result: 'success!',
        });

        return expect(res.successes[0].result).toBe('success!');
      });

      // skipping because these mocks aren't playing nicely with oclif
      it.skip('should not run if unable to connect to remote', async () => {
        git.remote = getGitRemoteMock('bad-remote', 'http://somebadurl.git');

        const res = await oclifConfig.runHook('createGHA', {
          command: CurrentCommand,
          parsedOpts: opts,
          result: 'success!',
        });

        return expect(res.successes[0].result).toBe('success!');
      });

      it('should not run if user previously declined to set up GHA for current directory + pkg version', async () => {
        const repoRoot = process.cwd();

        configstore.set(getConfigStoreKey(repoRoot), await getMajorPkgVersion());

        const res = await oclifConfig.runHook('createGHA', {
          command: CurrentCommand,
          parsedOpts: opts,
          result: 'success!',
        });

        return expect(res.successes[0].result).toBe('success!');
      });

      it('should not run if in a CI environment', async () => {
        process.env.TEST_RDME_CI = 'true';
        const res = await oclifConfig.runHook('createGHA', {
          command: CurrentCommand,
          parsedOpts: opts,
          result: 'success!',
        });
        expect(res.successes[0].result).toBe('success!');
        // asserts that git commands aren't run in CI
        expect(git.checkIsRepo).not.toHaveBeenCalled();
        delete process.env.TEST_RDME_CI;
      });

      it('should not run if in an npm lifecycle', async () => {
        process.env.TEST_RDME_NPM_SCRIPT = 'true';
        const res = await oclifConfig.runHook('createGHA', {
          command: CurrentCommand,
          parsedOpts: opts,
          result: 'success!',
        });
        expect(res.successes[0].result).toBe('success!');
        // asserts that git commands aren't run in CI
        expect(git.checkIsRepo).not.toHaveBeenCalled();
        delete process.env.TEST_RDME_NPM_SCRIPT;
      });

      // skipping because these mocks aren't playing nicely with oclif
      it.skip('should not run if repo solely contains non-GitHub remotes', async () => {
        git.remote = getGitRemoteMock('origin', 'https://gitlab.com', 'main');

        const res = await oclifConfig.runHook('createGHA', {
          command: CurrentCommand,
          parsedOpts: opts,
          result: 'success!',
        });

        return expect(res.successes[0].result).toBe('success!');
      });
    });
  });

  describe('helper functions', () => {
    describe('#getGHAFileName', () => {
      it('should return cleaned up file name', () => {
        expect(getGHAFileName('test')).toBe('.github/workflows/test.yml');
      });

      it('should lowercase and remove whitespace', () => {
        expect(getGHAFileName('Hello World')).toBe('.github/workflows/hello-world.yml');
      });

      it('should clean up weird characters', () => {
        expect(getGHAFileName('Hello_World-Test*Ex@mple!')).toBe('.github/workflows/hello-world-test-ex-mple-.yml');
      });
    });
  });
});
