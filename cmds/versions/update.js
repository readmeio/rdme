const request = require('request-promise-native');
const config = require('config');
const { prompt } = require('enquirer');
const promptOpts = require('../../lib/prompts');

exports.command = 'versions:update';
exports.usage = 'versions:update <version>';
exports.description = 'Update an existing version for your project.';
exports.category = 'versions';
exports.weight = 4;

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
];

exports.run = async function(opts) {
  const { key, version, codename, newVersion, main, beta, isPublic, deprecated } = opts;

  if (!key) {
    return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
  }

  if (!version) {
    return Promise.reject(
      new Error('No version provided. Please specify a semantic version using `--version`.'),
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
      is_stable: foundVersion.is_stable || main || promptResponse.is_stable,
      is_beta: beta || promptResponse.is_beta,
      is_deprecated: deprecated || promptResponse.is_deprecated,
      is_hidden: promptResponse.is_stable ? false : !(isPublic || promptResponse.is_hidden),
    },
    auth: { user: key },
  };

  return request
    .put(`${config.host}/api/v1/version/${version}`, options)
    .then(() => Promise.resolve(`Version ${version} updated successfully.`))
    .catch(err => {
      return Promise.reject(
        new Error(
          err.error && err.error.description
            ? err.error.description
            : 'Failed to update version using your specified parameters.',
        ),
      );
    });
};
