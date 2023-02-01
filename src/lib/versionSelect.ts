import type { Version } from '../cmds/versions';

import APIError from './apiError';
import isCI from './isCI';
import { warn } from './logger';
import promptTerminal from './promptWrapper';
import readmeAPIFetch, { cleanHeaders, handleRes } from './readmeAPIFetch';

/**
 * Validates and returns a project version.
 *
 * @param versionFlag version input parameter
 * @param key project API key
 * @returns a cleaned up project version
 */
export async function getProjectVersion(versionFlag: string, key: string, returnStable = false): Promise<string> {
  try {
    if (versionFlag) {
      return await readmeAPIFetch(`/api/v1/version/${versionFlag}`, {
        method: 'get',
        headers: cleanHeaders(key),
      })
        .then(handleRes)
        .then((res: Version) => res.version);
    }

    if (isCI()) {
      warn('No `--version` parameter detected in current CI environment. Defaulting to main version.');
      return undefined;
    }

    const versionList: Version[] = await readmeAPIFetch('/api/v1/version', {
      method: 'get',
      headers: cleanHeaders(key),
    }).then(handleRes);

    if (versionList.length === 1) {
      return versionList[0].version;
    }

    if (returnStable) {
      const stableVersion = versionList.find(v => v.is_stable === true);
      return stableVersion.version;
    }

    const { versionSelection } = await promptTerminal({
      type: 'select',
      name: 'versionSelection',
      message: 'Select your desired version',
      choices: versionList.map(v => {
        return {
          title: v.version,
          value: v.version,
        };
      }),
    });

    return versionSelection;
  } catch (err) {
    return Promise.reject(new APIError(err));
  }
}
