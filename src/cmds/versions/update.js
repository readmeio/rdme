const config = require('config');
const { prompt } = require('enquirer');
const promptOpts = require('../../lib/prompts');
const { getProjectVersion } = require('../../lib/versionSelect');
const fetch = require('../../lib/fetch');
const { cleanHeaders, handleRes } = require('../../lib/fetch');
const { debug } = require('../../lib/logger');

module.exports = class UpdateVersionCommand {
  constructor() {
    this.command = 'versions:update';
    this.usage = 'versions:update --version=<version> [options]';
    this.description = 'Update an existing version for your project.';
    this.category = 'versions';
    this.position = 3;

    this.args = [
      {
        name: 'key',
        type: String,
        description: 'Project API key',
      },
      {
        name: 'version',
        type: String,
        description: 'Project version',
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
    const { key, version, codename, newVersion, main, beta, isPublic, deprecated } = opts;

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    const selectedVersion = await getProjectVersion(version, key, false).catch(e => {
      return Promise.reject(e);
    });

    debug(`selectedVersion: ${selectedVersion}`);

    const foundVersion = await fetch(`${config.get('host')}/api/v1/version/${selectedVersion}`, {
      method: 'get',
      headers: cleanHeaders(key),
    }).then(res => handleRes(res));

    const promptResponse = await prompt(promptOpts.createVersionPrompt([{}], opts, foundVersion));

    return fetch(`${config.get('host')}/api/v1/version/${selectedVersion}`, {
      method: 'put',
      headers: cleanHeaders(key, {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        codename: codename || '',
        version: newVersion || promptResponse.newVersion,
        is_stable: foundVersion.is_stable || main === 'true' || promptResponse.is_stable,
        is_beta: beta === 'true' || promptResponse.is_beta,
        is_deprecated: deprecated || promptResponse.is_deprecated,
        is_hidden: promptResponse.is_stable ? false : !(isPublic === 'true' || promptResponse.is_hidden),
      }),
    })
      .then(handleRes)
      .then(() => {
        return Promise.resolve(`Version ${selectedVersion} updated successfully.`);
      });
  }
};
