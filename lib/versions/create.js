const request = require('request-promise-native');
const config = require('config');
const { prompt } = require('enquirer');
const promptOpts = require('../../utils/prompts');
const { validateErrors } = require('../../utils/errorhandler');

exports.desc = 'Create a new version for your project';
exports.category = 'services';
exports.weight = 4;
exports.action = 'versions:create';

exports.run = async function({ opts }) {
  let versionList;
  const { key, version, codename, fork, main, beta, isPublic } = opts;

  await validateErrors([
    { key, message: 'No api key provided. Please use --key' },
    {
      key: version,
      message: 'No version provided. Please specify a semantic version using --version',
    },
  ]);

  if (!fork) {
    versionList = await request
      .get(`${config.host}/api/v1/version`, {
        json: true,
        auth: { user: key },
      })
      .catch(err => Promise.reject(new Error(err)));
  }

  const promptResponse = await prompt(promptOpts.createVersionPrompt(versionList, opts));

  const options = {
    json: {
      version,
      codename: codename || '',
      is_stable: main || promptResponse.is_stable,
      is_beta: beta || promptResponse.is_beta,
      from: fork || promptResponse.from,
      is_hidden: promptResponse.is_stable ? false : !(isPublic || promptResponse.is_hidden),
    },
    auth: { user: key },
  };

  return request
    .post(`${config.host}/api/v1/version`, options)
    .then(() => Promise.resolve(`Version ${version} created successfully`))
    .catch(err => {
      let errorDesc;
      try {
        errorDesc =
          typeof err.error === 'string' ? JSON.parse(err.error).description : err.error.description;
      } catch (e) {
        errorDesc = 'Failed to create a new version using your specified parameters.';
      }
      return Promise.reject(new Error(errorDesc));
    });
};
