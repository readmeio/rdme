import type { Version } from '../cmds/versions';

import config from 'config';

import APIError from './apiError';
import fetch, { cleanHeaders, handleRes } from './fetch';
import isCI from './isCI';
import { warn } from './logger';
import * as promptHandler from './prompts';
import promptTerminal from './promptWrapper';

/**
 * Validates and returns a project version.
 *
 * @param versionFlag version input parameter
 * @param key project API key
 * @returns a cleaned up project version
 */
export async function getProjectVersion(versionFlag: string, key: string): Promise<string> {
  try {
    if (versionFlag) {
      return await fetch(`${config.get('host')}/api/v1/version/${versionFlag}`, {
        method: 'get',
        headers: cleanHeaders(key),
      })
        .then(res => handleRes(res))
        .then((res: Version) => res.version);
    }

    if (isCI()) {
      warn('No `--version` parameter detected in current CI environment. Defaulting to main version.');
      return undefined;
    }

    const versionList: Version[] = await fetch(`${config.get('host')}/api/v1/version`, {
      method: 'get',
      headers: cleanHeaders(key),
    }).then(res => handleRes(res));

    const { versionSelection } = await promptTerminal(promptHandler.generatePrompts(versionList, true));

    return versionSelection;
  } catch (err) {
    return Promise.reject(new APIError(err));
  }
}
