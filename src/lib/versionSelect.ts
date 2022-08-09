import config from 'config';
import { prompt } from 'enquirer';

import APIError from './apiError';
import fetch, { cleanHeaders, handleRes } from './fetch';
import * as promptHandler from './prompts';

export async function getProjectVersion(versionFlag: string, key: string, allowNewVersion: boolean): Promise<string> {
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
      const {
        option,
        versionSelection,
        newVersion,
      }: { option: 'update' | 'create'; versionSelection: string; newVersion: string } = await prompt(
        promptHandler.generatePrompts(versionList)
      );

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

    const { versionSelection }: { versionSelection: string } = await prompt(
      promptHandler.generatePrompts(versionList, true)
    );

    return versionSelection;
  } catch (err) {
    return Promise.reject(new APIError(err));
  }
}
