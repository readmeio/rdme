const request = require('request-promise-native');
const config = require('config');
const { prompt } = require('enquirer');
const promptOpts = require('../prompts');

exports.desc = 'Update an existing version for your project';
exports.category = 'services';
exports.weight = 4;
exports.action = 'versions:update';

exports.run = async function({ opts }) {
  const { key, version, codename, newVersion, main, beta, isPublic, deprecated } = opts;

  if (!key) {
    return Promise.reject(new Error('No api key provided. Please use --key'));
  }

  if (!version) {
    return Promise.reject(
      new Error('No version provided. Please specify a semantic version using --version'),
    );
  }

  const promptResponse = await prompt(promptOpts.createVersionPrompt([{}], opts, true));
  const options = {
    json: {
      codename: codename || '',
      version: newVersion || promptResponse.newVersion,
      is_stable: main || promptResponse.is_stable,
      is_beta: beta || promptResponse.is_beta,
      is_deprecated: deprecated || promptResponse.is_deprecated,
      is_hidden: promptResponse.is_stable ? false : !(isPublic || promptResponse.is_hidden),
    },
    auth: { user: key },
  };

  return request.put(`${config.host}/api/v1/version/${version}`, options).catch(err => {
    let errorDesc;
    try {
      errorDesc = JSON.parse(err.error).description;
    } catch (e) {
      errorDesc = 'Failed to update version using your specified parameters.';
    }
    return Promise.reject(new Error(errorDesc));
  });
};
