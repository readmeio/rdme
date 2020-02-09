const request = require('request-promise-native');
const config = require('config');
const semver = require('semver');
const { prompt } = require('enquirer');
const promptOpts = require('../../lib/prompts');

exports.command = 'versions:create';
exports.usage = 'versions:create --version=<version> [options]';
exports.description = 'Create a new version for your project.';
exports.category = 'versions';
exports.position = 2;

exports.hiddenArgs = ['version'];
exports.args = [
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

exports.run = async function(opts) {
  let versionList;
  const { key, version, codename, fork, main, beta, isPublic } = opts;

  if (!key) {
    return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
  }

  if (!version || !semver.valid(semver.coerce(version))) {
    return Promise.reject(
      new Error(`Please specify a semantic version. See \`${config.cli} help ${exports.command}\` for help.`)
    );
  }

  if (!fork) {
    versionList = await request
      .get(`${config.host}/api/v1/version`, {
        json: true,
        auth: { user: key },
      })
      .catch(e => Promise.reject(e.error));
  }

  const promptResponse = await prompt(promptOpts.createVersionPrompt(versionList || [{}], opts));
  const options = {
    json: {
      version,
      codename: codename || '',
      is_stable: main === 'true' || promptResponse.is_stable,
      is_beta: beta === 'true' || promptResponse.is_beta,
      from: fork || promptResponse.from,
      is_hidden: promptResponse.is_stable ? false : !(isPublic === 'true' || promptResponse.is_hidden),
    },
    auth: { user: key },
  };

  return request
    .post(`${config.host}/api/v1/version`, options)
    .then(() => Promise.resolve(`Version ${version} created successfully.`))
    .catch(err => {
      return Promise.reject(
        new Error(
          err.error && err.error.description
            ? err.error.description
            : 'Failed to create a new version using your specified parameters.'
        )
      );
    });
};
