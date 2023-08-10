/* eslint-disable no-console */
import type commands from '../../src/cmds';
import type { CommandOptions } from '../../src/lib/baseCommand';
import type Command from '../../src/lib/baseCommand';
import type { Response } from 'simple-git';

import fs from 'fs';

import prompts from 'prompts';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import ChangelogsCommand from '../../src/cmds/changelogs';
import CustomPagesCommand from '../../src/cmds/custompages';
import DocsCommand from '../../src/cmds/docs';
import OpenAPICommand from '../../src/cmds/openapi';
import OpenAPIValidateCommand from '../../src/cmds/openapi/validate';
import configstore from '../../src/lib/configstore';
import createGHA, { getConfigStoreKey, getGHAFileName, getGitData, git } from '../../src/lib/createGHA';
import { getMajorPkgVersion } from '../../src/lib/getPkgVersion';
import { after, before } from '../helpers/get-gha-setup';
import getGitRemoteMock from '../helpers/get-git-mock';
import ghaWorkflowSchema from '../helpers/github-workflow-schema.json';

const testWorkingDir = process.cwd();

let consoleInfoSpy;
const getCommandOutput = () => consoleInfoSpy.mock.calls.join('\n\n');

const key = 'API_KEY';

describe('#createGHA', () => {
  let yamlOutput;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

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
      CmdClass: typeof Command;
      cmd: keyof typeof commands;
      /** used to differentiate describe blocks */
      label: string;
      opts: CommandOptions<Record<string, string>>;
    }>([
      { cmd: 'openapi:validate', CmdClass: OpenAPIValidateCommand, opts: { spec: 'petstore.json' }, label: '' },
      { cmd: 'openapi', CmdClass: OpenAPICommand, opts: { key, spec: 'petstore.json', id: 'spec_id' }, label: '' },
      { cmd: 'docs', CmdClass: DocsCommand, opts: { key, folder: './docs', version: '1.0.0' }, label: '' },
      {
        cmd: 'docs',
        CmdClass: DocsCommand,
        label: ' (single)',
        opts: { key, filePath: './docs/rdme.md', version: '1.0.0' },
      },
      { cmd: 'changelogs', CmdClass: ChangelogsCommand, opts: { key, filePath: './changelogs' }, label: '' },
      {
        cmd: 'changelogs',
        CmdClass: ChangelogsCommand,
        label: ' (single)',
        opts: { key, filePath: './changelogs/rdme.md' },
      },
      { cmd: 'custompages', CmdClass: CustomPagesCommand, opts: { key, filePath: './custompages' }, label: '' },
      {
        cmd: 'custompages',
        CmdClass: CustomPagesCommand,
        label: ' (single)',
        opts: { key, filePath: './custompages/rdme.md' },
      },
    ])('$cmd $label', ({ cmd, CmdClass, opts }) => {
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

        git.revparse = vi.fn(() => {
          return Promise.resolve(repoRoot) as unknown as Response<string>;
        });

        const fileName = `rdme-${cmd}`;
        prompts.inject([true, 'some-branch', fileName]);

        fs.mkdirSync = vi.fn(() => {
          return '';
        });

        await expect(createGHA('', cmd, command.args, opts)).resolves.toBeTruthy();

        expect(fs.mkdirSync).toHaveBeenCalledWith('.github/workflows', { recursive: true });
        expect(fs.writeFileSync).toHaveBeenCalledWith(getGHAFileName(fileName), expect.any(String));
      });

      it('should run if user is on an outdated package version', async () => {
        const fileName = `rdme-${cmd}`;
        prompts.inject([true, 'some-branch', fileName]);

        const repoRoot = process.cwd();

        configstore.set(getConfigStoreKey(repoRoot), (await getMajorPkgVersion()) - 1);

        return expect(createGHA('', cmd, command.args, opts)).resolves.toMatch(
          'Your GitHub Actions workflow file has been created!',
        );
      });

      it('should set config and exit if user does not want to set up GHA', async () => {
        expect.assertions(2);
        prompts.inject([false]);

        const repoRoot = process.cwd();

        git.revparse = vi.fn(() => {
          return Promise.resolve(repoRoot) as unknown as Response<string>;
        });

        await expect(createGHA('', cmd, command.args, opts)).rejects.toStrictEqual(
          new Error(
            'GitHub Actions workflow creation cancelled. If you ever change your mind, you can run this command again with the `--github` flag.',
          ),
        );

        expect(configstore.get(getConfigStoreKey(repoRoot))).toBe(await getMajorPkgVersion());
      });

      it('should not run if not a repo', () => {
        git.checkIsRepo = vi.fn(() => {
          return Promise.reject(new Error('not a repo')) as unknown as Response<boolean>;
        });

        git.remote = getGitRemoteMock('', '', '');

        return expect(createGHA('success!', cmd, command.args, opts)).resolves.toBe('success!');
      });

      it('should not run if a repo with no remote', () => {
        git.remote = getGitRemoteMock('', '', '');

        return expect(createGHA('success!', cmd, command.args, opts)).resolves.toBe('success!');
      });

      it('should not run if unable to connect to remote', () => {
        git.remote = getGitRemoteMock('bad-remote', 'http://somebadurl.git');

        return expect(createGHA('success!', cmd, command.args, opts)).resolves.toBe('success!');
      });

      it('should not run if user previously declined to set up GHA for current directory + pkg version', async () => {
        const repoRoot = process.cwd();

        configstore.set(getConfigStoreKey(repoRoot), await getMajorPkgVersion());

        return expect(createGHA('success!', cmd, command.args, opts)).resolves.toBe('success!');
      });

      it('should not run if in a CI environment', async () => {
        process.env.TEST_RDME_CI = 'true';
        await expect(createGHA('success!', cmd, command.args, opts)).resolves.toBe('success!');
        // asserts that git commands aren't run in CI
        expect(git.checkIsRepo).not.toHaveBeenCalled();
        delete process.env.TEST_RDME_CI;
      });

      it('should not run if in an npm lifecycle', async () => {
        process.env.TEST_RDME_NPM_SCRIPT = 'true';
        await expect(createGHA('success!', cmd, command.args, opts)).resolves.toBe('success!');
        // asserts that git commands aren't run in CI
        expect(git.checkIsRepo).not.toHaveBeenCalled();
        delete process.env.TEST_RDME_NPM_SCRIPT;
      });

      it('should not run if repo solely contains non-GitHub remotes', () => {
        git.remote = getGitRemoteMock('origin', 'https://gitlab.com', 'main');

        return expect(createGHA('success!', cmd, command.args, opts)).resolves.toBe('success!');
      });
    });
  });

  describe('helper functions', () => {
    describe('#getGitData', () => {
      it('should return correct data in default case', () => {
        const repoRoot = '/someroot';

        git.revparse = vi.fn(() => {
          return Promise.resolve(repoRoot) as unknown as Response<string>;
        });

        return expect(getGitData()).resolves.toStrictEqual({
          containsGitHubRemote: true,
          defaultBranch: 'main',
          isRepo: true,
          repoRoot,
        });
      });

      it('should return empty repoRoot if function fails', () => {
        git.revparse = vi.fn(() => {
          return Promise.reject(new Error('some error')) as unknown as Response<string>;
        });

        return expect(getGitData()).resolves.toStrictEqual({
          containsGitHubRemote: true,
          defaultBranch: 'main',
          isRepo: true,
          repoRoot: '',
        });
      });

      it('should still return values if every git check fails', () => {
        git.remote = getGitRemoteMock('', '', '');

        git.checkIsRepo = vi.fn(() => {
          return Promise.reject(new Error('some error')) as unknown as Response<boolean>;
        });

        git.revparse = vi.fn(() => {
          return Promise.reject(new Error('some error')) as unknown as Response<string>;
        });

        return expect(getGitData()).resolves.toStrictEqual({
          containsGitHubRemote: undefined,
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
