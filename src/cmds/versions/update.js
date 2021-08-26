const config = require('config');
const { prompt } = require('enquirer');
const promptOpts = require('../../lib/prompts');
const APIError = require('../../lib/apiError');
const { cleanHeaders } = require('../../lib/cleanHeaders');
const { getProjectVersion } = require('../../lib/versionSelect');
const fetch = require('node-fetch');
const { handleRes } = require('../../lib/handleRes');

exports.command = 'versions:update';
exports.usage = 'versions:update --version=<version> [options]';
exports.description = 'Update an existing version for your project.';
exports.category = 'versions';
exports.position = 3;

exports.args = [
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

exports.run = async function (opts) {
  const { key, version, codename, newVersion, main, beta, isPublic, deprecated } = opts;

  if (!key) {
    return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
  }

  const selectedVersion = await getProjectVersion(version, key, false).catch(e => {
    return Promise.reject(e);
  });

  const foundVersion = await fetch(`${config.host}/api/v1/version/${selectedVersion}`, {
    method: 'get',
    headers: cleanHeaders(key),
  }).then(res => handleRes(res));

  const promptResponse = await prompt(promptOpts.createVersionPrompt([{}], opts, foundVersion));

  return fetch(`${config.host}/api/v1/version/${selectedVersion}`, {
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
    .then(res => res.json())
    .then(res => {
      if (res.error) {
        return Promise.reject(new APIError(res));
      }
      return Promise.resolve(`Version ${selectedVersion} updated successfully.`);
    });
};
