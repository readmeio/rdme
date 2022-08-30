import type commands from '../../cmds';
import type { CommandOptions } from '../baseCommand';
import type { OptionDefinition } from 'command-line-usage';

import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import prompts from 'prompts';
import semverMajor from 'semver/functions/major';
import simpleGit from 'simple-git';

import { transcludeString } from 'hercule/promises';

import pkg from '../../../package.json';
import configstore from '../configstore';
import isCI from '../isCI';
import { debug } from '../logger';
import promptTerminal from '../promptWrapper';

import yamlBase from './baseFile';

/**
 * Generates the key for storing info in `configstore` object.
 * @param repoRoot The root of the repo
 */
export const getConfigStoreKey = (repoRoot: string) => `createGHA.${repoRoot}`;
/**
 * The directory where GitHub Actions workflow files are stored.
 *
 * This is the same across all repositories on GitHub.
 *
 * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#about-yaml-syntax-for-workflows}
 */
const GITHUB_WORKFLOW_DIR = '.github/workflows';
const GITHUB_SECRET_NAME = 'README_API_KEY';

/**
 * The current `rdme` version
 *
 * @example "8.0.0"
 * @note the reason why this is a function is
 * because we want to mock it for our snapshots.
 * @see {@link https://stackoverflow.com/a/54245672}
 */
export const getPkgVersion = () => pkg.version;

/**
 * The current major `rdme` version
 *
 * @example 8
 */
export const rdmeVersionMajor = semverMajor(getPkgVersion());

export const git = simpleGit();

/**
 * Removes any non-alphanumeric characters and replaces them with hyphens.
 *
 * This is used for file names and for YAML keys.
 */
const cleanFileName = (input: string) => input.replace(/[^a-z0-9]/gi, '-');

/**
 * Removes any non-file-friendly characters and adds
 * the full path + file extension for GitHub Workflow files.
 * @param fileName raw file name to clean up
 */
export const getGHAFileName = (fileName: string) => {
  return path.join(GITHUB_WORKFLOW_DIR, `${cleanFileName(fileName).toLowerCase()}.yml`);
};

/**
 * Constructs the command string that we pass into the workflow file.
 */
function constructCmdString(
  command: keyof typeof commands,
  args: OptionDefinition[],
  opts: CommandOptions<Record<string, string | boolean | undefined>>
): string {
  const optsString = args
    .sort(arg => (arg.defaultOption ? -1 : 0))
    .map(arg => {
      const val = opts[arg.name];
      // if default option, return the value
      if (arg.defaultOption) return val;
      // obfuscate the key in a GitHub secret
      if (arg.name === 'key') return `--key=$\{{ secrets.${GITHUB_SECRET_NAME} }}`;
      // remove the GitHub flag
      if (arg.name === 'github') return false;
      // if a boolean value, return the flag
      if (arg.type === Boolean && val) return `--${arg.name}`;
      if (val) return `--${arg.name}=${val}`;
      return false;
    })
    .filter(Boolean)
    .join(' ');

  return `${command} ${optsString}`.trim();
}

/**
 * Function to return various git attributes needed for running GitHub Action
 */
export async function getGitData() {
  // Expressions to search raw output of `git remote show origin`
  const headRegEx = /^ {2}HEAD branch: /g;
  const headLineRegEx = /^ {2}HEAD branch:.*/gm;

  const isRepo = await git.checkIsRepo().catch(e => {
    debug(`error running git repo check: ${e.message}`);
    return false;
  });

  let containsGitHubRemote;
  let containsNonGitHubRemote;
  let defaultBranch;
  const rawRemotes = await git.remote([]).catch(e => {
    debug(`error grabbing git remotes: ${e.message}`);
    return '';
  });

  if (rawRemotes) {
    const remote = rawRemotes.split('\n')[0];
    const rawRemote = await git.remote(['show', remote]);
    // Extract head branch from git output
    const rawHead = headLineRegEx.exec(rawRemote as string)?.[0];
    if (rawHead) defaultBranch = rawHead.replace(headRegEx, '');

    // Extract the word 'github' from git output
    const remotesList = (await git.remote(['-v'])) as string;
    // This is a bit hairy but we want to keep it fairly general here
    // in case of GitHub Enterprise, etc.
    containsGitHubRemote = /github/.test(remotesList);
    containsNonGitHubRemote = /gitlab/.test(remotesList) || /bitbucket/.test(remotesList);
  }

  const repoRoot = await git.revparse(['--show-toplevel']).catch(e => {
    debug(`error grabbing git root: ${e.message}`);
    return '';
  });

  return { containsGitHubRemote, containsNonGitHubRemote, defaultBranch, isRepo, repoRoot };
}

/**
 * Post-command flow for creating a GitHub Action workflow file.
 *
 */
export default async function createGHA(
  msg: string,
  command: keyof typeof commands,
  args: OptionDefinition[],
  opts: CommandOptions<{}>
) {
  const { containsGitHubRemote, containsNonGitHubRemote, defaultBranch, isRepo, repoRoot } = await getGitData();

  if (!opts.github) {
    if (
      // not a repo
      !isRepo ||
      // in a CI environment
      isCI() ||
      // user has previously declined to set up GHA for current repo and `rdme` package version
      configstore.get(getConfigStoreKey(repoRoot)) === rdmeVersionMajor ||
      // is a repo, but only contains non-GitHub remotes
      (isRepo && containsNonGitHubRemote && !containsGitHubRemote) ||
      // not testing this function
      (process.env.NODE_ENV === 'testing' && !process.env.TEST_CREATEGHA)
    ) {
      // We return the original command message and pretend this command flow never happened.
      return msg;
    }
  }

  /**
   * The reason we're using console.info() in these lines as opposed to
   * our logger is because that logger has some formatting limitations
   * and this function doesn't ever run in a GitHub Actions environment.
   * By using `info` as opposed to `log`, we also can mock it in our tests
   * while also freely using `log` when debugging our code.
   *
   * @see {@link https://github.com/readmeio/rdme/blob/main/CONTRIBUTING.md#usage-of-console}
   */
  // eslint-disable-next-line no-console
  if (msg) console.info(msg);

  if (opts.github) {
    // eslint-disable-next-line no-console
    console.info('\n🐙 `--github` option detected! 🐙\n');
  } else {
    // eslint-disable-next-line no-console
    console.info('\n🐙 GitHub Repository detected! 🐙\n');
  }

  if (repoRoot) process.chdir(repoRoot);

  prompts.override({ shouldCreateGHA: opts.github });

  const { branch, filePath, shouldCreateGHA }: { branch: string; filePath: string; shouldCreateGHA: boolean } =
    await promptTerminal(
      [
        {
          message: 'Do you want to create a GitHub Action so you can run this command automatically in GitHub?',
          name: 'shouldCreateGHA',
          type: 'confirm',
          initial: true,
        },
        {
          message: 'What branch on GitHub should this workflow run on?',
          name: 'branch',
          type: 'text',
          initial: defaultBranch || 'main',
        },
        {
          message: 'What would you like to name the GitHub Actions workflow file?',
          name: 'filePath',
          type: 'text',
          initial: cleanFileName(`rdme-${command}`),
          format: prev => getGHAFileName(prev),
          validate: value => {
            if (value.length) {
              const fullPath = getGHAFileName(value);
              if (!fs.existsSync(fullPath)) {
                return true;
              }

              return 'Specified output path already exists.';
            }

            return 'An output path must be supplied.';
          },
        },
      ],
      {
        // @ts-expect-error answers is definitely an object,
        // despite TS insisting that it's an array.
        // link: https://github.com/terkelg/prompts#optionsonsubmit
        onSubmit: (p, a, answers: { shouldCreateGHA: boolean }) => !answers.shouldCreateGHA,
      }
    );

  if (!shouldCreateGHA) {
    // if the user says no, we don't want to bug them again
    // for this repo and version of `rdme
    configstore.set(getConfigStoreKey(repoRoot), rdmeVersionMajor);
    throw new Error(
      'GitHub Action Workflow cancelled. If you ever change your mind, you can run this command again with the `--github` flag.'
    );
  }

  const cleanCommand = cleanFileName(command);
  const commandString = constructCmdString(command, args, opts);
  const timestamp = new Date().toISOString();

  /**
   * Custom resolver for usage in `hercule`.
   *
   * @param url The variables from [the file template](./baseFile.ts)
   * @see {@link https://github.com/jamesramsay/hercule#resolvers}
   */
  const customResolver = function (
    url: 'branch' | 'cleanCommand' | 'command' | 'commandString' | 'rdmeVersion' | 'timestamp'
  ): {
    content: string;
  } {
    const data = {
      branch,
      cleanCommand,
      command,
      commandString,
      rdmeVersion: getPkgVersion(),
      timestamp,
    };
    return { content: data[url] };
  };

  const { output } = await transcludeString(yamlBase, { resolvers: [customResolver] });

  if (!fs.existsSync(GITHUB_WORKFLOW_DIR)) {
    fs.mkdirSync(GITHUB_WORKFLOW_DIR, { recursive: true });
  }

  fs.writeFileSync(filePath, output);

  return Promise.resolve(
    [
      chalk.green('\nYour GitHub Action has been created! ✨\n'),
      "You're almost finished! Just a couple more steps:",
      `1. Commit and push your newly created file (${filePath}) to GitHub 🚀`,
      `2. Create a GitHub secret called \`${GITHUB_SECRET_NAME}\` and populate that with a ReadMe API key 🔑`,
    ].join('\n')
  );
}
