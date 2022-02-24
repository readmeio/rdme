const config = require('config');
const semver = require('semver');
const { prompt } = require('enquirer');
const promptOpts = require('../../lib/prompts');
const fetch = require('../../lib/fetch');
const { cleanHeaders, handleRes } = require('../../lib/fetch');
const { debug } = require('../../lib/logger');

module.exports = class CreateVersionCommand {
  constructor() {
    this.command = 'versions:create';
    this.usage = 'versions:create --version=<version> [options]';
    this.description = 'Create a new version for your project.';
    this.category = 'versions';
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

  async run(opts) {
    let versionList;
    const { key, version, codename, fork, main, beta, isPublic } = opts;

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (!key) {
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

    const versionPrompt = promptOpts.createVersionPrompt(versionList || [{}], {
      newVersion: version,
      ...opts,
    });

    const promptResponse = await prompt(versionPrompt);

    return fetch(`${config.get('host')}/api/v1/version`, {
      method: 'post',
      headers: cleanHeaders(key, {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
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
};
