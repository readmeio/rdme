const request = require('request-promise-native');
const config = require('config');
const prompts = require('prompts');
const promptOpts = require('../prompts');

exports.desc = 'Create a new version for your project';
exports.category = 'services';
exports.weight = 4;
exports.action = 'versions:create';

exports.run = async function({ opts }) {
  let { key } = opts;
  const { version, codename } = opts;

  if (!key && opts.token) {
    console.warn(
      'Using `rdme` with --token has been deprecated. Please use --key and --id instead',
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

  const versionList = await request
    .get(`${config.host}/api/v1/version`, {
      json: true,
      auth: { user: key },
    })
    .catch(err => Promise.reject(new Error(err)));

  const promptSelection = promptOpts.createVersionPrompt(versionList);
  const { fork, main } = await prompts(promptSelection);

  const options = {
    json: {
      version,
      fork,
      codename: codename || '',
      is_stable: main,
    },
    auth: { user: key },
  };

  return request
    .post(`${config.host}/api/v1/version`, options)
    .catch(err => Promise.reject(new Error(err)));
};
