import type { CommandOptions } from '../../lib/baseCommand';

import config from 'config';
import { prompt } from 'enquirer';
import { Headers } from 'node-fetch';
import semver from 'semver';

import Command, { CommandCategories } from '../../lib/baseCommand';
import fetch, { cleanHeaders, handleRes } from '../../lib/fetch';
import * as promptHandler from '../../lib/prompts';

export type Options = {
  beta?: string | boolean;
  codename?: string;
  fork?: string;
  isPublic?: string | boolean;
  main?: string | boolean;
};

export default class CreateVersionCommand extends Command {
  constructor() {
    super();

    this.command = 'versions:create';
    this.usage = 'versions:create --version=<version> [options]';
    this.description = 'Create a new version for your project.';
    this.cmdCategory = CommandCategories.VERSIONS;
    this.position = 2;

    this.hiddenArgs = ['version'];
    this.args = [
      {
        name: 'key',
        type: String,
        description: 'Project API key',
      },
      {
        name: 'version',
        type: String,
        defaultOption: true,
      },
      {
        name: 'fork',
        type: String,
        description: "The semantic version which you'd like to fork from.",
      },
      {
        name: 'codename',
        type: String,
        description: 'The codename, or nickname, for a particular version.',
      },
      {
        name: 'main',
        type: String,
        description: 'Should this version be the primary (default) version for your project?',
      },
      {
        name: 'beta',
        type: String,
        description: 'Is this version in beta?',
      },
      {
        name: 'isPublic',
        type: String,
        description: 'Would you like to make this version public? Any primary version must be public.',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    super.run(opts);

    let versionList;
    const { key, version, codename, fork, main, beta, isPublic } = opts;

    if (!opts.key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    if (!version || !semver.valid(semver.coerce(version))) {
      return Promise.reject(
        new Error(`Please specify a semantic version. See \`${config.get('cli')} help ${this.command}\` for help.`)
      );
    }

    if (!fork) {
      versionList = await fetch(`${config.get('host')}/api/v1/version`, {
        method: 'get',
        headers: cleanHeaders(key),
      }).then(res => handleRes(res));
    }

    const versionPrompt = promptHandler.createVersionPrompt(versionList || [{}], {
      newVersion: version,
      ...opts,
    });

    const promptResponse: { from: string; is_beta: string; is_hidden: string; is_stable: string } = await prompt(
      // @ts-expect-error Seems like our version prompts aren't what Enquirer actually expects.
      versionPrompt
    );

    return fetch(`${config.get('host')}/api/v1/version`, {
      method: 'post',
      headers: cleanHeaders(
        key,
        new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        })
      ),
      body: JSON.stringify({
        version,
        codename: codename || '',
        is_stable: main === 'true' || promptResponse.is_stable,
        is_beta: beta === 'true' || promptResponse.is_beta,
        from: fork || promptResponse.from,
        is_hidden: promptResponse.is_stable ? false : !(isPublic === 'true' || promptResponse.is_hidden),
      }),
    })
      .then(handleRes)
      .then(() => {
        return Promise.resolve(`Version ${version} created successfully.`);
      });
  }
}
