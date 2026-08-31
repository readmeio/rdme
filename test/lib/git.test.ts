import type { Hook } from '@oclif/core';
import type { Response } from 'simple-git';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getGitData, git } from '../../src/lib/git.js';
import { getGitRemoteMock } from '../helpers/git-mock.js';

describe('#getGitData', () => {
  const original = {
    checkIsRepo: git.checkIsRepo,
    remote: git.remote,
    revparse: git.revparse,
  };

  const ctx = { debug: vi.fn() } as unknown as Hook.Context;

  beforeEach(() => {
    git.checkIsRepo = vi.fn(() => Promise.resolve(true) as unknown as Response<boolean>);
    git.revparse = vi.fn(() => Promise.resolve('/repo') as unknown as Response<string>);
  });

  afterEach(() => {
    git.checkIsRepo = original.checkIsRepo;
    git.remote = original.remote;
    git.revparse = original.revparse;
    vi.clearAllMocks();
  });

  it('returns GitHub remote detection, default branch, and repo root', async () => {
    git.remote = getGitRemoteMock('origin', 'https://github.com/readmeio/rdme.git', 'main');

    await expect(getGitData.call(ctx)).resolves.toStrictEqual({
      containsGitHubRemote: true,
      defaultBranch: 'main',
      isRepo: true,
      repoRoot: '/repo',
    });
  });

  it('treats GitHub Enterprise remotes as GitHub and parses a non-main HEAD branch', async () => {
    git.remote = getGitRemoteMock('origin', 'https://github.example.com/org/repo.git', 'develop');

    await expect(getGitData.call(ctx)).resolves.toStrictEqual({
      containsGitHubRemote: true,
      defaultBranch: 'develop',
      isRepo: true,
      repoRoot: '/repo',
    });
  });

  it('does not treat non-GitHub remotes as GitHub', async () => {
    git.remote = getGitRemoteMock('origin', 'https://gitlab.com/org/repo.git', 'main');

    await expect(getGitData.call(ctx)).resolves.toStrictEqual({
      containsGitHubRemote: false,
      defaultBranch: 'main',
      isRepo: true,
      repoRoot: '/repo',
    });
  });

  it('returns isRepo=false when the git repo check fails', async () => {
    git.checkIsRepo = vi.fn(() => Promise.reject(new Error('not a repo')) as unknown as Response<boolean>);
    git.remote = getGitRemoteMock('', '', '');

    await expect(getGitData.call(ctx)).resolves.toStrictEqual({
      containsGitHubRemote: undefined,
      defaultBranch: undefined,
      isRepo: false,
      repoRoot: '/repo',
    });
  });

  it('leaves remote metadata undefined when listing remotes fails', async () => {
    git.remote = getGitRemoteMock('', '', '');

    await expect(getGitData.call(ctx)).resolves.toStrictEqual({
      containsGitHubRemote: undefined,
      defaultBranch: undefined,
      isRepo: true,
      repoRoot: '/repo',
    });
  });

  it('leaves defaultBranch undefined when the remote cannot be inspected', async () => {
    git.remote = getGitRemoteMock('bad-remote', 'https://github.com/readmeio/rdme.git');

    await expect(getGitData.call(ctx)).resolves.toStrictEqual({
      containsGitHubRemote: true,
      defaultBranch: undefined,
      isRepo: true,
      repoRoot: '/repo',
    });
  });

  it('returns an empty repoRoot when revparse fails', async () => {
    git.remote = getGitRemoteMock();
    git.revparse = vi.fn(() => Promise.reject(new Error('not a git repo')) as unknown as Response<string>);

    await expect(getGitData.call(ctx)).resolves.toStrictEqual({
      containsGitHubRemote: true,
      defaultBranch: 'main',
      isRepo: true,
      repoRoot: '',
    });
  });
});
