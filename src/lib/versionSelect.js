const ciDetect = require('@npmcli/ci-detect');
const config = require('config');
const { prompt } = require('enquirer');

const APIError = require('./apiError');
const { cleanHeaders, handleRes } = require('./fetch');
const fetch = require('./fetch');
const promptOpts = require('./prompts');
const { warn } = require('./logger');

/**
 * Validates and returns a project version.
 *
 * @param {String} versionFlag version input parameter
 * @param {String} key project API key
 * @param {Boolean} allowNewVersion if true, goes through prompt flow
 * for creating a new project version
 * @returns {String} a cleaned up project version
 */
async function getProjectVersion(versionFlag, key, allowNewVersion) {
  try {
    if (versionFlag) {
      return await fetch(`${config.get('host')}/api/v1/version/${versionFlag}`, {
        method: 'get',
        headers: cleanHeaders(key),
      })
        .then(res => handleRes(res))
        .then(res => res.version);
    }

    if ((ciDetect() && process.env.NODE_ENV !== 'testing') || process.env.TEST_CI) {
      warn('No `--version` parameter detected in current CI environment. Defaulting to main version.');
      return undefined;
    }

    const versionList = await fetch(`${config.get('host')}/api/v1/version`, {
      method: 'get',
      headers: cleanHeaders(key),
    }).then(res => handleRes(res));

    if (allowNewVersion) {
      const { option, versionSelection, newVersion } = await prompt(promptOpts.generatePrompts(versionList));

      if (option === 'update') return versionSelection;

      await fetch(`${config.get('host')}/api/v1/version`, {
        method: 'post',
        headers: cleanHeaders(key, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          from: versionList[0].version,
          version: newVersion,
          is_stable: false,
        }),
      });

      return newVersion;
    }

    const { versionSelection } = await prompt(promptOpts.generatePrompts(versionList, true));
    return versionSelection;
  } catch (err) {
    return Promise.reject(new APIError(err));
  }
}

module.exports = { getProjectVersion };
