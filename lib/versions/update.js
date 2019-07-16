const request = require('request-promise-native');
const config = require('config');
const { prompt } = require('enquirer');
const promptOpts = require('../../utils/prompts');
const { validateErrors } = require('../../utils/errorhandler');

exports.desc = 'Update an existing version for your project';
exports.category = 'services';
exports.weight = 4;
exports.action = 'versions:update';

exports.run = async function({ opts }) {
  const { key, version, codename, newVersion, main, beta, isPublic, deprecated } = opts;

  await validateErrors([
    { key, message: 'No api key provided. Please use --key' },
    {
      key: version,
      message: 'No version provided. Please specify a semantic version using --version',
    },
  ]);

  const foundVersion = await request.get(`${config.host}/api/v1/version/${version}`, {
    auth: { user: key },
  });

  const promptResponse = await prompt(
    promptOpts.createVersionPrompt(
      [{}],
      opts,
      foundVersion ? JSON.parse(foundVersion) : foundVersion,
    ),
  );
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
