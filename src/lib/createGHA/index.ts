import type { Command, Hook } from '@oclif/core';

import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import prompts from 'prompts';

import configstore from '../configstore.js';
import { getMajorPkgVersion } from '../getPkg.js';
import { getGitData } from '../git.js';
import isCI, { isNpmScript, isTest } from '../isCI.js';
import { info } from '../logger.js';
import promptTerminal from '../promptWrapper.js';
import { cleanFileName, validateFilePath } from '../validatePromptInput.js';
import yamlBase from './baseFile.js';

type CommandArg = Record<string, Command.Arg.Cached>;
type CommandFlag = Record<string, Command.Flag.Cached>;
type ParsedOpts = Record<string, unknown>;

/**
 * Generates the key for storing info in `configstore` object.
 */
export const getConfigStoreKey = (
  /** the root of the repository */
  repoRoot: string,
) => `createGHA.${repoRoot}`;
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
 * Removes any non-file-friendly characters and adds
 * the full path + file extension for GitHub Workflow files.
 */
export const getGHAFileName = (
  /** raw file name to clean up */
  fileName: string,
) => {
  return path.join(GITHUB_WORKFLOW_DIR, `${cleanFileName(fileName).toLowerCase()}.yml`);
};

/**
 * Returns a redacted `key` if the current command uses authentication.
 * Otherwise, returns `false`.
 */
function getKey(args: CommandFlag, opts: ParsedOpts): string | false {
  if (Object.keys(args).some(arg => arg === 'key')) {
    return `••••••••••••${(opts.key as string)?.slice(-5) || ''}`;
  }
  return false;
}

/**
 * Constructs the command string that we pass into the workflow file.
 */
function constructCommandString(commandId: string, args: CommandArg, flags: CommandFlag, opts: ParsedOpts): string {
  const argsString = Object.keys(args)
    .map(arg => {
      return opts[arg];
    })
    .filter(Boolean)
    .join(' ');

  const flagsString = Object.keys(flags)
    .map(flag => {
      const val = opts[flag];
      // obfuscate the key in a GitHub secret
      if (flag === 'key') return `--key=$\{{ secrets.${GITHUB_SECRET_NAME} }}`;
      // remove the GitHub flag
      if (flag === 'github') return false;
      // if a boolean value, return the flag
      if (flags[flag].type === 'boolean' && val) return `--${flag}`;
      if (val) return `--${flag}=${val}`;
      return false;
    })
    .filter(Boolean)
    .join(' ');

  return `${commandId} ${argsString} ${flagsString}`.trim();
}

/**
 * Post-command flow for creating a GitHub Actions workflow file.
 *
 */
export default async function createGHA(
  this: Hook.Context,
  msg: string,
  command: Command.Class,
  parsedOpts: ParsedOpts,
) {
  const { args, flags, id: commandId } = command;
  if (!commandId) throw new Error('unable to determine command ID yikes');
  this.debug(`running GHA onboarding for ${commandId} command`);
  this.debug(`opts used in createGHA: ${JSON.stringify(parsedOpts)}`);

  // if in a CI environment,
  // don't even bother running the git commands
  if (!parsedOpts.github && (isCI() || isNpmScript() || (isTest() && !process.env.TEST_RDME_CREATEGHA))) {
    this.debug('not running GHA onboarding workflow in CI, npm script, or default test env, exiting 👋');
    return msg;
  }

  const { containsGitHubRemote, defaultBranch, isRepo, repoRoot } = await getGitData.call(this);

  const configVal = configstore.get(getConfigStoreKey(repoRoot));
  this.debug(`repo value in config: ${configVal}`);

  const majorPkgVersion = await getMajorPkgVersion.call(this);
  this.debug(`major pkg version: ${majorPkgVersion}`);

  if (!parsedOpts.github) {
    if (
      // not a repo
      !isRepo ||
      // user has previously declined to set up GHA for current repo and `rdme` package version
      configVal === majorPkgVersion ||
      // is a repo, but does not contain a GitHub remote
      (isRepo && !containsGitHubRemote)
    ) {
      this.debug('not running GHA onboarding workflow, exiting');
      // We return the original command message and pretend this command flow never happened.
      return msg;
    }
  }

  if (msg) info(msg, { includeEmojiPrefix: false });

  if (parsedOpts.github) {
    info(chalk.bold("\n🚀 Let's get you set up with GitHub Actions! 🚀\n"), { includeEmojiPrefix: false });
  } else {
    info(
      [
        '',
        chalk.bold("🐙 Looks like you're running this command in a GitHub Repository! 🐙"),
        '',
        `🚀 With a few quick clicks, you can run this \`${commandId}\` command via GitHub Actions (${chalk.underline(
          'https://github.com/features/actions',
        )})`,
        '',
        `✨ This means it will run ${chalk.italic('automagically')} with every push to a branch of your choice!`,
        '',
      ].join('\n'),
      { includeEmojiPrefix: false },
    );
  }

  const previousWorkingDirectory = process.cwd();
  if (repoRoot && repoRoot !== previousWorkingDirectory) {
    process.chdir(repoRoot);
    this.debug(`switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
  }

  prompts.override({ shouldCreateGHA: parsedOpts.github });

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
          initial: cleanFileName(`rdme-${commandId}`),
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
    cleanCommand: cleanFileName(commandId),
    command: commandId,
    commandString: constructCommandString(commandId, args, flags, parsedOpts),
    rdmeVersion: `v${majorPkgVersion}`,
    timestamp: new Date().toISOString(),
  };

  this.debug(`data for resolver: ${JSON.stringify(data)}`);

  let output = yamlBase;

  Object.keys(data).forEach(key => {
    output = output.replace(new RegExp(`{{${key}}}`, 'g'), data[key as keyof typeof data]);
  });

  if (!fs.existsSync(GITHUB_WORKFLOW_DIR)) {
    this.debug('GHA workflow directory does not exist, creating');
    fs.mkdirSync(GITHUB_WORKFLOW_DIR, { recursive: true });
  }

  fs.writeFileSync(filePath, output);

  const success = [chalk.green('\nYour GitHub Actions workflow file has been created! ✨\n')];

  const key = getKey(flags, parsedOpts);

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
