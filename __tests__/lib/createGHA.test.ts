/* eslint-disable no-console */
import type commands from '../../src/cmds';
import type { CommandOptions } from '../../src/lib/baseCommand';
import type { Response } from 'simple-git';

import '../helpers/jest.matchers';

import fs from 'fs';

import fetch from 'node-fetch';
import prompts from 'prompts';

import OpenAPICommand from '../../src/cmds/openapi';
import ValidateCommand from '../../src/cmds/validate';
import configstore from '../../src/lib/configstore';
import createGHA, { cleanUpFileName, git, getGitData, getConfigStoreKey } from '../../src/lib/createGHA';
import getGitRemoteMock from '../helpers/get-git-mock';
import ghaWorkflowSchemaBackup from '../helpers/github-workflow-schema.json';

const testWorkingDir = process.cwd();

const ghaWorkflowUrl = 'https://json.schemastore.org/github-workflow.json';

let consoleInfoSpy;
const getCommandOutput = () => consoleInfoSpy.mock.calls.join('\n\n');

describe('#createGHA', () => {
  let ghaWorkflowSchema;

  beforeAll(async () => {
    ghaWorkflowSchema = await fetch(ghaWorkflowUrl)
      .then(res => res.json())
      .catch(() => {
        console.error('error fetching JSON schema');
        return ghaWorkflowSchemaBackup;
      });
  });

  beforeEach(() => {
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

    // global Date override to handle timestamp generation
    // stolen from here: https://github.com/facebook/jest/issues/2234#issuecomment-294873406
    const DATE_TO_USE = new Date('2022');
    // @ts-expect-error we're just overriding the constructor for tests,
    // no need to construct everything
    global.Date = jest.fn(() => DATE_TO_USE);

    git.checkIsRepo = jest.fn(() => {
      return Promise.resolve(true) as unknown as Response<boolean>;
    });

    git.remote = getGitRemoteMock();

    process.env.TEST_CREATEGHA = 'true';
  });

  afterEach(() => {
    configstore.clear();
    consoleInfoSpy.mockRestore();
    delete process.env.TEST_CREATEGHA;
    jest.clearAllMocks();
    process.chdir(testWorkingDir);
  });

  describe('command inputs', () => {
    describe.each([
      ['validate' as keyof typeof commands, ValidateCommand, { spec: 'petstore.json' } as CommandOptions<{}>],
      [
        'openapi' as keyof typeof commands,
        OpenAPICommand,
        { spec: 'petstore.json', id: 'spec_id' } as CommandOptions<{}>,
      ],
    ])('%s', (cmd, CmdClass, opts) => {
      let command;

      beforeEach(() => {
        command = new CmdClass();
      });

      it('should run GHA creation workflow and generate valid workflow file', async () => {
        expect.assertions(6);
        const fileName = `rdme-${cmd}`;
        prompts.inject([true, 'some-branch', fileName]);

        let yamlOutput;

        fs.writeFileSync = jest.fn((f, d) => {
          yamlOutput = d;
          return true;
        });

        await expect(createGHA('', cmd, command.args, opts)).resolves.toMatchSnapshot();

        expect(yamlOutput).toBeValidSchema(ghaWorkflowSchema);
        expect(yamlOutput).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));
        expect(console.info).toHaveBeenCalledTimes(1);
        const output = getCommandOutput();
        expect(output).toMatch('GitHub Repository detected!');
      });

      it('should run GHA creation workflow with `--github` flag and messy file name and generate valid workflow file', async () => {
        expect.assertions(4);
        const fileName = `rdme-${cmd} with GitHub flag`;
        prompts.inject(['another-branch', fileName]);

        let yamlOutput;

        fs.writeFileSync = jest.fn((f, d) => {
          yamlOutput = d;
          return true;
        });

        await expect(createGHA('', cmd, command.args, { ...opts, github: true })).resolves.toMatchSnapshot();

        expect(yamlOutput).toBeValidSchema(ghaWorkflowSchema);
        expect(yamlOutput).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(cleanUpFileName(fileName), expect.any(String));
      });

      it('should create workflow directory if it does not exist', async () => {
        expect.assertions(3);
        const repoRoot = '__tests__/__fixtures__';

        git.revparse = jest.fn(() => {
          return Promise.resolve(repoRoot) as unknown as Response<string>;
        });

        const fileName = `rdme-${cmd}`;
        prompts.inject([true, 'some-branch', fileName]);

        fs.mkdirSync = jest.fn(() => {
          return '';
        });

        fs.writeFileSync = jest.fn(() => {
          return true;
        });

        await expect(createGHA('', cmd, command.args, opts)).resolves.toBeTruthy();

        expect(fs.mkdirSync).toHaveBeenCalledWith('.github/workflows', { recursive: true });
        expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yml`, expect.any(String));
      });

      it('should set config and exit if user does not want to set up GHA', async () => {
        expect.assertions(2);
        prompts.inject([false]);

        const repoRoot = process.cwd();

        git.revparse = jest.fn(() => {
          return Promise.resolve(repoRoot) as unknown as Response<string>;
        });

        await expect(createGHA('', cmd, command.args, opts)).rejects.toStrictEqual(
          new Error(
            'GitHub Action Workflow cancelled. If you ever change your mind, you can run this command again with the `--github` flag.'
          )
        );

        expect(configstore.get(getConfigStoreKey(repoRoot))).toBe('2022-01-01T00:00:00.000Z');
      });

      it('should not run if not a repo', () => {
        git.checkIsRepo = jest.fn(() => {
          return Promise.reject(new Error('not a repo')) as unknown as Response<boolean>;
        });

        git.remote = getGitRemoteMock('', '', '');

        return expect(createGHA('success!', cmd, command.args, opts)).resolves.toBe('success!');
      });

      it('should not run if user previously declined to set up GHA for current directory', () => {
        const repoRoot = process.cwd();

        configstore.set(getConfigStoreKey(repoRoot), 'some-date');

        git.revparse = jest.fn(() => {
          return Promise.resolve(repoRoot) as unknown as Response<string>;
        });

        return expect(createGHA('success!', cmd, command.args, opts)).resolves.toBe('success!');
      });

      it('should not run if in a CI environment', async () => {
        process.env.TEST_CI = 'true';
        await expect(createGHA('success!', cmd, command.args, opts)).resolves.toBe('success!');
        delete process.env.TEST_CI;
      });

      it('should not run if repo only contains non-GitHub remotes', () => {
        git.remote = getGitRemoteMock('origin', 'https://gitlab.com', 'main');

        return expect(createGHA('success!', cmd, command.args, opts)).resolves.toBe('success!');
      });
    });
  });

  describe('helper functions', () => {
    describe('#getGitData', () => {
      it('should return correct data in default case', () => {
        const repoRoot = '/someroot';

        git.revparse = jest.fn(() => {
          return Promise.resolve(repoRoot) as unknown as Response<string>;
        });

        return expect(getGitData()).resolves.toStrictEqual({
          containsGitHubRemote: true,
          containsNonGitHubRemote: false,
          defaultBranch: 'main',
          isRepo: true,
          repoRoot,
        });
      });

      it('should return empty repoRoot if function fails', () => {
        git.revparse = jest.fn(() => {
          return Promise.reject(new Error('some error')) as unknown as Response<string>;
        });

        return expect(getGitData()).resolves.toStrictEqual({
          containsGitHubRemote: true,
          containsNonGitHubRemote: false,
          defaultBranch: 'main',
          isRepo: true,
          repoRoot: '',
        });
      });

      it('should still return values if every git check fails', () => {
        git.remote = getGitRemoteMock('', '', '');

        git.checkIsRepo = jest.fn(() => {
          return Promise.reject(new Error('some error')) as unknown as Response<boolean>;
        });

        git.revparse = jest.fn(() => {
          return Promise.reject(new Error('some error')) as unknown as Response<string>;
        });

        return expect(getGitData()).resolves.toStrictEqual({
          containsGitHubRemote: undefined,
          containsNonGitHubRemote: undefined,
          defaultBranch: undefined,
          isRepo: false,
          repoRoot: '',
        });
      });
    });

    describe('#cleanUpFileName', () => {
      it('should return cleaned up file name', () => {
        expect(cleanUpFileName('test')).toBe('.github/workflows/test.yml');
      });

      it('should lowercase and remove whitespace', () => {
        expect(cleanUpFileName('Hello World')).toBe('.github/workflows/hello-world.yml');
      });

      it('should clean up weird characters', () => {
        expect(cleanUpFileName('Hello_World-Test*Ex@mple!')).toBe('.github/workflows/hello-world-test-ex-mple-.yml');
      });
    });
  });
});
