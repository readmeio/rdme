const { prompt } = require('enquirer');
const promptOpts = require('./prompts');
const fetch = require('node-fetch');
const config = require('config');
const APIError = require('./apiError');

async function getProjectVersion(versionFlag, key, allowNewVersion) {
  const encodedString = Buffer.from(`${key}:`).toString('base64');

  try {
    if (versionFlag) {
      return await fetch(`${config.host}/api/v1/version/${versionFlag}`, {
        method: 'get',
        headers: { Authorization: `Basic ${encodedString}` },
      })
        .then(res => res.json())
        .then(res => res.version);
    }

    const versionList = await fetch(`${config.host}/api/v1/version`, {
      method: 'get',
      headers: { Authorization: `Basic ${encodedString}` },
    }).then(res => res.json());

    if (allowNewVersion) {
      const { option, versionSelection, newVersion } = await prompt(promptOpts.generatePrompts(versionList));

      if (option === 'update') return versionSelection;

      await fetch(`${config.host}/api/v1/version`, {
        method: 'post',
        headers: { Authorization: `Basic ${encodedString}`, 'Content-Type': 'application/json' },
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
