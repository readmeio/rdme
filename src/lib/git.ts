import type { Hook } from '@oclif/core';

import { simpleGit } from 'simple-git';

export const git = simpleGit();

/**
 * Function to return various git attributes needed for running GitHub Action
 */
export async function getGitData(this: Hook.Context) {
  // Expressions to search raw output of `git remote show origin`
  const headRegEx = /^ {2}HEAD branch: /g;
  const headLineRegEx = /^ {2}HEAD branch:.*/gm;

  const isRepo = await git.checkIsRepo().catch(e => {
    this.debug(`[getGitData] error running git repo check: ${e.message}`);
    return false;
  });

  this.debug(`[getGitData] isRepo result: ${isRepo}`);

  let containsGitHubRemote;
  let defaultBranch;
  const rawRemotes = await git.remote([]).catch(e => {
    this.debug(`[getGitData] error grabbing git remotes: ${e.message}`);
    return '';
  });

  this.debug(`[getGitData] rawRemotes result: ${rawRemotes}`);

  if (rawRemotes) {
    const remote = rawRemotes.split('\n')[0];
    this.debug(`[getGitData] remote result: ${remote}`);
    const rawRemote = await git.remote(['show', remote]).catch(e => {
      this.debug(`[getGitData] error accessing remote: ${e.message}`);
      return '';
    });

    this.debug(`[getGitData] rawRemote result: ${rawRemote}`);
    // Extract head branch from git output
    const rawHead = headLineRegEx.exec(rawRemote as string)?.[0];
    this.debug(`[getGitData] rawHead result: ${rawHead}`);
    if (rawHead) defaultBranch = rawHead.replace(headRegEx, '');

    // Extract the word 'github' from git output
    const remotesList = (await git.remote(['-v'])) as string;
    this.debug(`[getGitData] remotesList result: ${remotesList}`);
    // This is a bit hairy but we want to keep it fairly general here
    // in case of GitHub Enterprise, etc.
    containsGitHubRemote = /github/.test(remotesList);
  }

  this.debug(`[getGitData] containsGitHubRemote result: ${containsGitHubRemote}`);
  this.debug(`[getGitData] defaultBranch result: ${defaultBranch}`);

  const repoRoot = await git.revparse(['--show-toplevel']).catch(e => {
    this.debug(`[getGitData] error grabbing git root: ${e.message}`);
    return '';
  });

  this.debug(`[getGitData] repoRoot result: ${repoRoot}`);

  return { containsGitHubRemote, defaultBranch, isRepo, repoRoot };
}
