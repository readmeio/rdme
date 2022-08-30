/* eslint-disable no-console */
import type commands from '../../src/cmds';
import type { CommandOptions } from '../../src/lib/baseCommand';
import type { Response } from 'simple-git';

import '../helpers/jest.matchers';

import fs from 'fs';

import fetch from 'node-fetch';
import prompts from 'prompts';

import ChangelogsCommand from '../../src/cmds/changelogs';
import SingleChangelogCommand from '../../src/cmds/changelogs/single';
import CustomPagesCommand from '../../src/cmds/custompages';
import SingleCustomPageCommand from '../../src/cmds/custompages/single';
import DocsCommand from '../../src/cmds/docs';
import SingleDocCommand from '../../src/cmds/docs/single';
import OpenAPICommand from '../../src/cmds/openapi';
import ValidateCommand from '../../src/cmds/validate';
import configstore from '../../src/lib/configstore';
import createGHA, {
  getConfigStoreKey,
  getGHAFileName,
  getGitData,
  git,
  rdmeVersionMajor,
} from '../../src/lib/createGHA';
import * as createGHAObject from '../../src/lib/createGHA';
import getGitRemoteMock from '../helpers/get-git-mock';
import ghaWorkflowSchemaBackup from '../helpers/github-workflow-schema.json';

const testWorkingDir = process.cwd();

const ghaWorkflowUrl = 'https://json.schemastore.org/github-workflow.json';

let consoleInfoSpy;
const getCommandOutput = () => consoleInfoSpy.mock.calls.join('\n\n');

const key = 'API_KEY';

describe('#createGHA', () => {
  let ghaWorkflowSchema;
  let yamlOutput;

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

    fs.writeFileSync = jest.fn((f, d) => {
      yamlOutput = d;
      return true;
    });

    const spy = jest.spyOn(createGHAObject, 'getPkgVersion');
    spy.mockReturnValue('7.8.9');

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
        { key, spec: 'petstore.json', id: 'spec_id' } as CommandOptions<{}>,
      ],
      ['docs' as keyof typeof commands, DocsCommand, { key, folder: './docs', version: '1.0.0' } as CommandOptions<{}>],
      [
        'docs:single' as keyof typeof commands,
        SingleDocCommand,
        { key, filePath: './docs/rdme.md', version: '1.0.0' } as CommandOptions<{}>,
      ],
      ['changelogs' as keyof typeof commands, ChangelogsCommand, { key, folder: './changelogs' } as CommandOptions<{}>],
      [
        'changelogs:single' as keyof typeof commands,
        SingleChangelogCommand,
        { key, filePath: './changelogs/rdme.md' } as CommandOptions<{}>,
      ],
      [
        'custompages' as keyof typeof commands,
        CustomPagesCommand,
        { key, folder: './custompages' } as CommandOptions<{}>,
      ],
      [
        'custompages:single' as keyof typeof commands,
        SingleCustomPageCommand,
        { key, filePath: './custompages/rdme.md' } as CommandOptions<{}>,
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

        await expect(createGHA('', cmd, command.args, opts)).resolves.toMatchSnapshot();

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

        await expect(createGHA('', cmd, command.args, { ...opts, github: true })).resolves.toMatchSnapshot();

        expect(yamlOutput).toBeValidSchema(ghaWorkflowSchema);
        expect(yamlOutput).toMatchSnapshot();
        expect(fs.writeFileSync).toHaveBeenCalledWith(getGHAFileName(fileName), expect.any(String));
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

        await expect(createGHA('', cmd, command.args, opts)).resolves.toBeTruthy();

        expect(fs.mkdirSync).toHaveBeenCalledWith('.github/workflows', { recursive: true });
        expect(fs.writeFileSync).toHaveBeenCalledWith(getGHAFileName(fileName), expect.any(String));
      });

      it('should run if user is on an outdated package version', () => {
        const fileName = `rdme-${cmd}`;
        prompts.inject([true, 'some-branch', fileName]);

        const repoRoot = process.cwd();

        configstore.set(getConfigStoreKey(repoRoot), rdmeVersionMajor - 1);

        return expect(createGHA('', cmd, command.args, opts)).resolves.toMatch(
          'Your GitHub Actions workflow file has been created!'
        );
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
            'GitHub Actions workflow creation cancelled. If you ever change your mind, you can run this command again with the `--github` flag.'
          )
        );

        expect(configstore.get(getConfigStoreKey(repoRoot))).toBe(rdmeVersionMajor);
      });

      it('should not run if not a repo', () => {
        git.checkIsRepo = jest.fn(() => {
          return Promise.reject(new Error('not a repo')) as unknown as Response<boolean>;
        });

        git.remote = getGitRemoteMock('', '', '');

        return expect(createGHA('success!', cmd, command.args, opts)).resolves.toBe('success!');
      });

      it('should not run if user previously declined to set up GHA for current directory + pkg version', () => {
        const repoRoot = process.cwd();

        configstore.set(getConfigStoreKey(repoRoot), rdmeVersionMajor);

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
