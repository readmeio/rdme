import type commands from '../../cmds';
import type { CommandOptions } from '../baseCommand';
import type { OptionDefinition } from 'command-line-usage';

import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import fetch from 'node-fetch';
import prompts from 'prompts';

import { transcludeFile } from 'hercule/promises';

import pkg from '../../../package.json';
import { debug } from '../logger';
import promptTerminal from '../promptWrapper';

const latestGitHubPackageUrl = 'https://api.github.com/repos/readmeio/rdme/releases/latest';

const GITHUB_SECRET_NAME = 'README_API_KEY';

function getLatestPackageVersion(): Promise<string> {
  return fetch(latestGitHubPackageUrl)
    .then(res => res.json())
    .then(res => res.tag_name)
    .catch(err => {
      debug(`error fetching package tag from github: ${err.message}`);
      // as a fallback, return package version
      return pkg.version;
    });
}

function constructOptsString(args: OptionDefinition[], opts: CommandOptions<{}>): string {
  return args
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
  // eslint-disable-next-line no-console
  if (msg) console.log(msg);

  prompts.override({ shouldCreateGHA: opts.github });

  const { branch, shouldCreateGHA, filePath } = await promptTerminal(
    [
      {
        message: 'Do you want to create a GitHub Action so you can run this command automatically in GitHub?',
        name: 'shouldCreateGHA',
        type: 'confirm',
        initial: true,
      },
      {
        message: 'What branch do you want to run this on?',
        name: 'branch',
        type: 'text',
        initial: 'main',
      },
      {
        message: 'What would you like to name this file?',
        name: 'filePath',
        type: 'text',
        initial: `rdme-${command}`,
        format: prev => path.join('.github/workflows/', `${prev}.yaml`),
      },
    ],
    {
      // @ts-expect-error answers is definitely an object,
      // despite TS insisting that it's an array.
      onSubmit: (p, a, answers: { shouldCreateGHA: boolean }) => !answers.shouldCreateGHA,
    }
  );

  if (!shouldCreateGHA) {
    throw new Error(
      'GitHub Action Workflow cancelled. If you ever change your mind, you can run this command again with the `--github` flag.'
    );
  }

  const optsString = constructOptsString(args, opts);
  const rdmeVersion = await getLatestPackageVersion();
  const timestamp = new Date().toISOString();

  /**
   * Custom resolver for usage in `hercule`.
   *
   * @param url The variables from the `base.yml` template
   * @see {@link https://github.com/jamesramsay/hercule#resolvers}
   */
  const customResolver = function (url: 'branch' | 'command' | 'rdmeVersion' | 'optsString' | 'timestamp'): {
    content: string;
  } {
    const data = {
      branch,
      command,
      rdmeVersion,
      timestamp,
      optsString,
    };
    return { content: data[url] };
  };

  const { output } = await transcludeFile('./src/lib/createGHA/base.yml', { resolvers: [customResolver] });

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
