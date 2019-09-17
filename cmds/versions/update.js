const request = require('request-promise-native');
const config = require('config');
const semver = require('semver');
const { prompt } = require('enquirer');
const promptOpts = require('../../lib/prompts');

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

exports.run = async function(opts) {
  const { key, version, codename, newVersion, main, beta, isPublic, deprecated } = opts;

  if (!key) {
    return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
  }

  if (!version || !semver.valid(semver.coerce(version))) {
    return Promise.reject(
      new Error(
        `Please specify a semantic version. See \`${config.cli} help ${exports.command}\` for help.`,
      ),
    );
  }

  const foundVersion = await request
    .get(`${config.host}/api/v1/version/${version}`, {
      json: true,
      auth: { user: key },
    })
    .catch(e => Promise.reject(e.error));

  const promptResponse = await prompt(promptOpts.createVersionPrompt([{}], opts, foundVersion));
  const options = {
    json: {
      codename: codename || '',
      version: newVersion || promptResponse.newVersion,
      is_stable: foundVersion.is_stable || main === 'true' || promptResponse.is_stable,
      is_beta: beta === 'true' || promptResponse.is_beta,
      is_deprecated: deprecated || promptResponse.is_deprecated,
      is_hidden: promptResponse.is_stable
        ? false
        : !(isPublic === 'true' || promptResponse.is_hidden),
    },
    auth: { user: key },
  };

  return request
    .put(`${config.host}/api/v1/version/${version}`, options)
    .then(() => Promise.resolve(`Version ${version} updated successfully.`));
};
