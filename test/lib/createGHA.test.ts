import type { Command, Config, Hook } from '@oclif/core';
import type { Response } from 'simple-git';
import type { MockInstance } from 'vitest';

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import prompts from 'prompts';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import configstore from '../../src/lib/configstore.js';
import createGHA, { getConfigStoreKey, getGHAFileName } from '../../src/lib/createGHA/index.js';
import { getMajorPkgVersion } from '../../src/lib/getPkg.js';
import { git } from '../../src/lib/git.js';
import { getGitRemoteMock, gitMock } from '../helpers/git-mock.js';
import ghaWorkflowSchema from '../helpers/github-workflow-schema.json' with { type: 'json' };
import { setupOclifConfig } from '../helpers/oclif.js';
import { toBeValidSchema } from '../helpers/vitest.matchers.js';

const testWorkingDir = process.cwd();

let consoleInfoSpy: MockInstance<typeof console.info>;
const getCommandOutput = () => consoleInfoSpy.mock.calls.join('\n\n');

const key = 'API_KEY';

describe('#createGHA', () => {
  let oclifConfig: Config;
  let yamlOutput: string;

  beforeAll(() => {
    expect.extend({ toBeValidSchema });
  });

  beforeEach(async () => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    oclifConfig = await setupOclifConfig();

    gitMock.before((fileName, data: string) => {
      yamlOutput = data;
    });
  });

  afterEach(() => {
    gitMock.after();

    consoleInfoSpy.mockRestore();
    process.chdir(testWorkingDir);
  });

  describe('command inputs', () => {
    describe.each<{
      cmd: string;
      /** used to differentiate describe blocks */
      name: string;
      opts: Record<string, string>;
    }>([
      // `openapi:validate` is the ID we define in src/index.ts for backwards compatibility,
      // hence we're using this command ID here
      { cmd: 'openapi:validate', opts: { spec: 'petstore.json' }, name: 'openapi:validate' },
      { cmd: 'changelogs', opts: { key, path: './changelogs' }, name: 'changelogs' },
      {
        cmd: 'changelogs',
        name: 'changelogs (single)',
        opts: { key, path: './changelogs/rdme.md' },
      },
    ])('$name', ({ cmd, opts }) => {
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
        expect(consoleInfoSpy).toHaveBeenCalledTimes(1);

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

      // oxlint-disable-next-line vitest/no-disabled-tests -- skipping because these mocks aren't playing nicely with oclif
      it.skip('should create workflow directory if it does not exist', async () => {
        expect.assertions(3);

        const repoRoot = 'test/__fixtures__';

        git.revparse = vi.fn(() => {
          return Promise.resolve(repoRoot) as unknown as Response<string>;
        });

        const fileName = `rdme-${cmd}`;
        prompts.inject([true, 'some-branch', fileName]);

        fs.mkdirSync = vi.fn<typeof fs.mkdirSync>(() => {
          return '';
        });

        const res = await oclifConfig.runHook('createGHA', { command: CurrentCommand, parsedOpts: opts, result: '' });

        expect(res.successes[0].result).toBe(true);

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

      // oxlint-disable-next-line vitest/no-disabled-tests -- skipping because these mocks aren't playing nicely with oclif
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

      // oxlint-disable-next-line vitest/no-disabled-tests -- skipping because these mocks aren't playing nicely with oclif
      it.skip('should not run if a repo with no remote', async () => {
        git.remote = getGitRemoteMock('', '', '');

        const res = await oclifConfig.runHook('createGHA', {
          command: CurrentCommand,
          parsedOpts: opts,
          result: 'success!',
        });

        return expect(res.successes[0].result).toBe('success!');
      });

      // oxlint-disable-next-line vitest/no-disabled-tests -- skipping because these mocks aren't playing nicely with oclif
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

      // oxlint-disable-next-line vitest/no-disabled-tests -- skipping because these mocks aren't playing nicely with oclif
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

  /**
   * These cases stay skipped at the oclif-hook layer because git mocks do not propagate through
   * `Config.runHook`. Calling `createGHA` from source covers the same contracts (and the generated
   * workflow command string) without depending on oclif's hook loader.
   */
  describe('source-level git gates and workflow contents', () => {
    const ctx = { debug: vi.fn() } as unknown as Hook.Context;
    const commandWithKey = {
      id: 'docs upload',
      args: { path: {} },
      flags: {
        key: { type: 'option' },
        github: { type: 'boolean' },
        'dry-run': { type: 'boolean' },
        branch: { type: 'option' },
      },
    } as unknown as Command.Class;
    const commandWithoutKey = {
      id: 'openapi validate',
      args: { spec: {} },
      flags: {
        github: { type: 'boolean' },
      },
    } as unknown as Command.Class;

    it('throws when the command id cannot be determined', async () => {
      await expect(createGHA.call(ctx, 'success!', { args: {}, flags: {} } as Command.Class, {})).rejects.toThrow(
        'unable to determine command ID yikes',
      );
    });

    it('returns the original command result when the working directory is not a git repo', async () => {
      git.checkIsRepo = vi.fn(() => {
        return Promise.reject(new Error('not a repo')) as unknown as Response<boolean>;
      });
      git.remote = getGitRemoteMock('', '', '');

      await expect(createGHA.call(ctx, 'success!', commandWithKey, { key })).resolves.toBe('success!');
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('returns the original command result when the repo has no remotes', async () => {
      git.remote = getGitRemoteMock('', '', '');

      await expect(createGHA.call(ctx, 'success!', commandWithKey, { key })).resolves.toBe('success!');
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('returns the original command result when the remote cannot be reached', async () => {
      git.remote = getGitRemoteMock('bad-remote', 'http://somebadurl.git');

      await expect(createGHA.call(ctx, 'success!', commandWithKey, { key })).resolves.toBe('success!');
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('returns the original command result when remotes are not GitHub', async () => {
      git.remote = getGitRemoteMock('origin', 'https://gitlab.com/org/repo.git', 'main');

      await expect(createGHA.call(ctx, 'success!', commandWithKey, { key })).resolves.toBe('success!');
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('still runs onboarding when `--github` is set even if the directory is not a repo', async () => {
      git.checkIsRepo = vi.fn(() => {
        return Promise.reject(new Error('not a repo')) as unknown as Response<boolean>;
      });
      prompts.inject(['main', 'rdme-forced-github']);

      const result = await createGHA.call(ctx, 'success!', commandWithKey, { key, github: true, path: './docs' });

      expect(result).toContain('Your GitHub Actions workflow file has been created!');
      expect(fs.writeFileSync).toHaveBeenCalledWith(getGHAFileName('rdme-forced-github'), expect.any(String));
    });

    it('creates the GitHub workflow directory when it does not exist', async () => {
      const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
      const mkdirSpy = vi.spyOn(fs, 'mkdirSync').mockReturnValue(undefined as never);
      prompts.inject([true, 'main', 'rdme-mkdir']);

      await createGHA.call(ctx, '', commandWithKey, { key, path: './docs' });

      expect(mkdirSpy).toHaveBeenCalledWith('.github/workflows', { recursive: true });
      existsSpy.mockRestore();
      mkdirSpy.mockRestore();
    });

    it('switches into the repo root before writing the workflow file', async () => {
      const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rdme-gha-root-'));
      git.revparse = vi.fn(() => {
        return Promise.resolve(repoRoot) as unknown as Response<string>;
      });
      prompts.inject([false]);

      await expect(createGHA.call(ctx, '', commandWithKey, { key })).rejects.toThrow(
        'GitHub Actions workflow creation cancelled',
      );
      expect(process.cwd()).toBe(repoRoot);

      process.chdir(testWorkingDir);
      fs.rmSync(repoRoot, { recursive: true, force: true });
    });

    it('builds a workflow command string that redacts the key and omits `--github`', async () => {
      prompts.inject([true, 'release', 'rdme-docs-upload']);

      const result = await createGHA.call(ctx, 'done', commandWithKey, {
        path: './docs',
        key: 'supersecretKEY',
        github: true,
        'dry-run': true,
        branch: '1.0.0',
      });

      const secretRef = `\${{ secrets.README_API_KEY }}`;
      expect(yamlOutput).toContain(`rdme: docs upload ./docs --key=${secretRef} --dry-run --branch=1.0.0`);
      expect(yamlOutput).not.toContain('supersecretKEY');
      expect(yamlOutput).not.toContain('--github');
      expect(result).toContain('••••••••••••etKEY');
      expect(result).toContain('README_API_KEY');
    });

    it('does not ask the user to create an API key secret for commands without `--key`', async () => {
      prompts.inject([true, 'main', 'rdme-openapi-validate']);

      const result = await createGHA.call(ctx, '', commandWithoutKey, { spec: 'petstore.json' });

      expect(result).toContain("you're all set");
      expect(result).not.toContain('README_API_KEY');
      expect(yamlOutput).toContain('rdme: openapi validate petstore.json');
    });
  });
});
