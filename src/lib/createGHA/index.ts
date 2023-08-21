import type commands from '../../cmds';
import type { CommandOptions } from '../baseCommand';
import type { OptionDefinition } from 'command-line-usage';

import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import prompts from 'prompts';
import simpleGit from 'simple-git';

import configstore from '../configstore';
import { getMajorPkgVersion } from '../getPkgVersion';
import isCI, { isNpmScript, isTest } from '../isCI';
import { debug, info } from '../logger';
import promptTerminal from '../promptWrapper';
import { cleanFileName, validateFilePath } from '../validatePromptInput';

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

export const git = simpleGit();

/**
 * Removes any non-file-friendly characters and adds
 * the full path + file extension for GitHub Workflow files.
 * @param fileName raw file name to clean up
 */
export const getGHAFileName = (fileName: string) => {
  return path.join(GITHUB_WORKFLOW_DIR, `${cleanFileName(fileName).toLowerCase()}.yml`);
};

/**
 * Returns a redacted `key` if the current command uses authentication.
 * Otherwise, returns `false`.
 */
function getKey(args: OptionDefinition[], opts: CommandOptions<{}>): string | false {
  if (args.some(arg => arg.name === 'key')) {
    return `••••••••••••${opts.key.slice(-5)}`;
  }
  return false;
}

/**
 * Constructs the command string that we pass into the workflow file.
 */
function constructCmdString(
  command: keyof typeof commands,
  args: OptionDefinition[],
  opts: CommandOptions<Record<string, string | boolean | undefined>>,
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

  debug(`[getGitData] isRepo result: ${isRepo}`);

  let containsGitHubRemote;
  let defaultBranch;
  const rawRemotes = await git.remote([]).catch(e => {
    debug(`[getGitData] error grabbing git remotes: ${e.message}`);
    return '';
  });

  debug(`[getGitData] rawRemotes result: ${rawRemotes}`);

  if (rawRemotes) {
    const remote = rawRemotes.split('\n')[0];
    debug(`[getGitData] remote result: ${remote}`);
    const rawRemote = await git.remote(['show', remote]).catch(e => {
      debug(`[getGitData] error accessing remote: ${e.message}`);
      return '';
    });

    debug(`[getGitData] rawRemote result: ${rawRemote}`);
    // Extract head branch from git output
    const rawHead = headLineRegEx.exec(rawRemote as string)?.[0];
    debug(`[getGitData] rawHead result: ${rawHead}`);
    if (rawHead) defaultBranch = rawHead.replace(headRegEx, '');

    // Extract the word 'github' from git output
    const remotesList = (await git.remote(['-v'])) as string;
    debug(`[getGitData] remotesList result: ${remotesList}`);
    // This is a bit hairy but we want to keep it fairly general here
    // in case of GitHub Enterprise, etc.
    containsGitHubRemote = /github/.test(remotesList);
  }

  debug(`[getGitData] containsGitHubRemote result: ${containsGitHubRemote}`);
  debug(`[getGitData] defaultBranch result: ${defaultBranch}`);

  const repoRoot = await git.revparse(['--show-toplevel']).catch(e => {
    debug(`[getGitData] error grabbing git root: ${e.message}`);
    return '';
  });

  debug(`[getGitData] repoRoot result: ${repoRoot}`);

  return { containsGitHubRemote, defaultBranch, isRepo, repoRoot };
}

/**
 * Post-command flow for creating a GitHub Actions workflow file.
 *
 */
export default async function createGHA(
  msg: string,
  command: keyof typeof commands,
  args: OptionDefinition[],
  opts: CommandOptions<{}>,
) {
  debug(`running GHA onboarding for ${command} command`);
  debug(`opts used in createGHA: ${JSON.stringify(opts)}`);

  // if in a CI environment,
  // don't even bother running the git commands
  if (!opts.github && (isCI() || isNpmScript())) {
    debug('not running GHA onboarding workflow in CI and/or npm script, exiting');
    return msg;
  }

  const { containsGitHubRemote, defaultBranch, isRepo, repoRoot } = await getGitData();

  const configVal = configstore.get(getConfigStoreKey(repoRoot));
  debug(`repo value in config: ${configVal}`);

  const majorPkgVersion = await getMajorPkgVersion();
  debug(`major pkg version: ${majorPkgVersion}`);

  if (!opts.github) {
    if (
      // not a repo
      !isRepo ||
      // user has previously declined to set up GHA for current repo and `rdme` package version
      configVal === majorPkgVersion ||
      // is a repo, but does not contain a GitHub remote
      (isRepo && !containsGitHubRemote) ||
      // not testing this function
      (isTest() && !process.env.TEST_RDME_CREATEGHA)
    ) {
      debug('not running GHA onboarding workflow, exiting');
      // We return the original command message and pretend this command flow never happened.
      return msg;
    }
  }

  if (msg) info(msg, { includeEmojiPrefix: false });

  if (opts.github) {
    info(chalk.bold("\n🚀 Let's get you set up with GitHub Actions! 🚀\n"), { includeEmojiPrefix: false });
  } else {
    info(
      [
        '',
        chalk.bold("🐙 Looks like you're running this command in a GitHub Repository! 🐙"),
        '',
        `🚀 With a few quick clicks, you can run this \`${command}\` command via GitHub Actions (${chalk.underline(
          'https://github.com/features/actions',
        )})`,
        '',
        `✨ This means it will run ${chalk.italic('automagically')} with every push to a branch of your choice!`,
        '',
      ].join('\n'),
      { includeEmojiPrefix: false },
    );
  }

  if (repoRoot) {
    const previousWorkingDirectory = process.cwd();
    process.chdir(repoRoot);
    debug(`switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
  }

  prompts.override({ shouldCreateGHA: opts.github });

  const { branch, filePath, shouldCreateGHA }: { branch: string; filePath: string; shouldCreateGHA: boolean } =
    await promptTerminal(
      [
        {
          message: 'Would you like to add a GitHub Actions workflow?',
          name: 'shouldCreateGHA',
          type: 'confirm',
          initial: true,
        },
        {
          message: 'What GitHub branch should this workflow run on?',
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
          validate: value => validateFilePath(value, getGHAFileName),
        },
      ],
      {
        // @ts-expect-error answers is definitely an object,
        // despite TS insisting that it's an array.
        // link: https://github.com/terkelg/prompts#optionsonsubmit
        onSubmit: (p, a, answers: { shouldCreateGHA: boolean }) => !answers.shouldCreateGHA,
      },
    );

  if (!shouldCreateGHA) {
    // if the user says no, we don't want to bug them again
    // for this repo and version of `rdme
    configstore.set(getConfigStoreKey(repoRoot), majorPkgVersion);
    throw new Error(
      'GitHub Actions workflow creation cancelled. If you ever change your mind, you can run this command again with the `--github` flag.',
    );
  }

  const data = {
    branch,
    cleanCommand: cleanFileName(command),
    command,
    commandString: constructCmdString(command, args, opts),
    rdmeVersion: `v${majorPkgVersion}`,
    timestamp: new Date().toISOString(),
  };

  debug(`data for resolver: ${JSON.stringify(data)}`);

  let output = yamlBase;

  Object.keys(data).forEach((key: keyof typeof data) => {
    output = output.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
  });

  if (!fs.existsSync(GITHUB_WORKFLOW_DIR)) {
    debug('GHA workflow directory does not exist, creating');
    fs.mkdirSync(GITHUB_WORKFLOW_DIR, { recursive: true });
  }

  fs.writeFileSync(filePath, output);

  const success = [chalk.green('\nYour GitHub Actions workflow file has been created! ✨\n')];

  const key = getKey(args, opts);

  if (key) {
    success.push(
      chalk.bold('Almost done! Just a couple more steps:'),
      `1. Push your newly created file (${chalk.underline(filePath)}) to GitHub 🚀`,
      `2. Create a GitHub secret called ${chalk.bold(
        GITHUB_SECRET_NAME,
      )} and populate the value with your ReadMe API key (${key}) 🔑`,
      '',
      `🔐 Check out GitHub's docs for more info on creating encrypted secrets (${chalk.underline(
        'https://docs.github.com/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository',
      )})`,
    );
  } else {
    success.push(
      `${chalk.bold('Almost done!')} Push your newly created file (${chalk.underline(
        filePath,
      )}) to GitHub and you're all set 🚀`,
    );
  }

  success.push(
    '',
    `🦉 If you have any more questions, feel free to drop us a line! ${chalk.underline('support@readme.io')}`,
    '',
  );

  return Promise.resolve(success.join('\n'));
}
