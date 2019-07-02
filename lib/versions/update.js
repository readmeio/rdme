const request = require('request-promise-native');
const config = require('config');
const promptOpts = require('../prompts');

exports.desc = 'Update an existing version for your project';
exports.category = 'services';
exports.weight = 4;
exports.action = 'versions:update';

exports.run = async function({ opts }) {
  let { key } = opts;
  let versionList;
  const { version, codename, fork, newVersion, main, beta, isPublic, deprecated } = opts;

  if (!key && opts.token) {
    console.warn(
      'Using `rdme` with --token has been deprecated. Please use --key and --id instead.',
    );
    [key] = opts.token.split('-');
  }

  if (!key) {
    return Promise.reject(new Error('No api key provided. Please use --key'));
  }

  if (!version) {
    return Promise.reject(
      new Error('No version provided. Please specify a semantic version using --version'),
    );
  }

  if (!fork) {
    versionList = await request
      .get(`${config.host}/api/v1/version`, {
        json: true,
        auth: { user: key },
      })
      .catch(err => Promise.reject(new Error(err)));
  }

  const promptResponse = await promptOpts.createVersionPrompt(versionList, opts, true);
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

  return request
    .put(`${config.host}/api/v1/version/${version}`, options)
    .catch(err => Promise.reject(new Error(err)));
};
