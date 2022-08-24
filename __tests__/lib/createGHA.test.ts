import type commands from '../../src/cmds';
import type { CommandOptions } from '../../src/lib/baseCommand';
import type { Response } from 'simple-git';

import fs from 'fs';

import prompts from 'prompts';

import ValidateCommand from '../../src/cmds/validate';
import createGHA, { git, getGitData } from '../../src/lib/createGHA';

/**
 * Creates a Jest mock function for testing `git.remote`
 * @param remote remote to return (usually `origin`)
 * @param remoteUrl git URL for the given remote
 * @param defaultBranch the HEAD branch
 */
function createGitRemoteMock(
  remote = 'origin',
  remoteUrl = 'https://github.com/readmeio/rdme.git',
  defaultBranch = 'main'
) {
  return jest.fn(arr => {
    // first call (used to grab remote for usage in subsequent commands)
    if (!arr.length) {
      if (!remote) return Promise.reject(new Error('Bad mock uh oh')) as unknown as Response<string>;
      return Promise.resolve(remote) as unknown as Response<string>;
    }
    // second call (used to grab default branch)
    if (arr.length === 2 && arr[0] === 'show' && arr[1] === remote) {
      if (!defaultBranch) return Promise.reject(new Error('Bad mock uh oh')) as unknown as Response<string>;
      return Promise.resolve(`* remote origin
  Fetch URL: ${remoteUrl}
  Push  URL: ${remoteUrl}
  HEAD branch: ${defaultBranch}
`) as unknown as Response<string>;
    }

    // third call (used to grab remote URLs)
    if (arr.length === 1 && arr[0] === '-v') {
      if (!remoteUrl) return Promise.reject(new Error('Bad mock uh oh')) as unknown as Response<string>;
      return Promise.resolve(`origin  ${remoteUrl} (fetch)
origin  ${remoteUrl} (push)
    `) as unknown as Response<string>;
    }

    return Promise.reject(new Error('Bad mock uh oh')) as unknown as Response<string>;
  });
}

describe('#createGHA', () => {
  beforeEach(() => {
    // global Date override to handle timestamp generation
    // stolen from here: https://github.com/facebook/jest/issues/2234#issuecomment-294873406
    const DATE_TO_USE = new Date('2022');
    // @ts-expect-error we're just overriding the constructor for tests,
    // no need to construct everything
    global.Date = jest.fn(() => DATE_TO_USE);
    process.env.TEST_CREATEGHA = 'true';
  });

  afterEach(() => {
    delete process.env.TEST_CREATEGHA;
    jest.clearAllMocks();
  });

  describe.each([
    ['validate' as keyof typeof commands, ValidateCommand, { spec: 'petstore.json' } as CommandOptions<{}>],
  ])('%s', (cmd, CmdClass, opts) => {
    let command;

    beforeEach(() => {
      command = new CmdClass();
    });

    it('should run GHA creation workflow', async () => {
      expect.assertions(3);
      const fileName = `rdme-${cmd}`;
      prompts.inject([true, 'main', fileName]);

      let yamlOutput;

      fs.writeFileSync = jest.fn((f, d) => {
        yamlOutput = d;
        return true;
      });

      git.remote = createGitRemoteMock();

      await expect(createGHA('', cmd, command.args, opts)).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yaml`, expect.any(String));
    });

    it('should run GHA creation workflow with `--github` flag', async () => {
      expect.assertions(3);
      const fileName = `rdme-${cmd}-with-github-flag`;
      prompts.inject(['main', fileName]);

      let yamlOutput;

      fs.writeFileSync = jest.fn((f, d) => {
        yamlOutput = d;
        return true;
      });

      await expect(createGHA('', cmd, command.args, { ...opts, github: true })).resolves.toMatchSnapshot();

      expect(yamlOutput).toMatchSnapshot();
      expect(fs.writeFileSync).toHaveBeenCalledWith(`.github/workflows/${fileName}.yaml`, expect.any(String));
    });

    it('should exit if user does not want to set up GHA', () => {
      prompts.inject([false]);

      return expect(createGHA('', cmd, command.args, opts)).rejects.toStrictEqual(
        new Error(
          'GitHub Action Workflow cancelled. If you ever change your mind, you can run this command again with the `--github` flag.'
        )
      );
    });
  });

  describe('#getGitData', () => {
    it('should return correct data in default case', () => {
      const repoRoot = '/someroot';
      git.remote = createGitRemoteMock();

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
      git.remote = createGitRemoteMock();

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
      git.remote = createGitRemoteMock('', '', '');

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
});
