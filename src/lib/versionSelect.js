const { prompt } = require('enquirer');
const promptOpts = require('./prompts');
const request = require('request-promise-native');
const config = require('config');
const APIError = require('./apiError');

async function getProjectVersion(versionFlag, key, allowNewVersion) {
  const options = { json: {}, auth: { user: key } };

  try {
    if (versionFlag) {
      options.json.version = versionFlag;
      const foundVersion = await request.get(`${config.host}/api/v1/version/${versionFlag}`, options);

      return foundVersion.version;
    }

    const versionList = await request.get(`${config.host}/api/v1/version`, options);

    if (allowNewVersion) {
      const { option, versionSelection, newVersion } = await prompt(promptOpts.generatePrompts(versionList));

      if (option === 'update') return versionSelection;

      options.json = { from: versionList[0].version, version: newVersion, is_stable: false };
      await request.post(`${config.host}/api/v1/version`, options);

      return newVersion;
    }

    const { versionSelection } = await prompt(promptOpts.generatePrompts(versionList, true));
    return versionSelection;
  } catch (err) {
    return Promise.reject(new APIError(err));
  }
}

module.exports = { getProjectVersion };
