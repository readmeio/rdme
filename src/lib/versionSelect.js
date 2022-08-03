import enquirer from 'enquirer';
import * as promptOpts from './prompts.js';
import config from 'config';
import APIError from './apiError.js';
import fetch, { cleanHeaders, handleRes } from './fetch.js';

const { prompt } = enquirer;

export async function getProjectVersion(versionFlag, key, allowNewVersion) {
  try {
    if (versionFlag) {
      return await fetch(`${config.get('host')}/api/v1/version/${versionFlag}`, {
        method: 'get',
        headers: cleanHeaders(key),
      })
        .then(res => handleRes(res))
        .then(res => res.version);
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
