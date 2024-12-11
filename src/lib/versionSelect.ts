import type { APIv1ErrorResponse } from './apiError.js';

import { APIv1Error } from './apiError.js';
import isCI from './isCI.js';
import { warn } from './logger.js';
import promptTerminal from './promptWrapper.js';
import { cleanAPIv1Headers, handleAPIv1Res, readmeAPIv1Fetch } from './readmeAPIFetch.js';

interface Version {
  codename?: string;
  createdAt?: string;
  from?: string;
  is_beta?: boolean;
  is_deprecated?: boolean;
  is_hidden?: boolean;
  is_stable: boolean;
  version: string;
}

/**
 * Validates and returns a project version.
 *
 * @param versionFlag version input parameter
 * @param key project API key
 * @returns a cleaned up project version
 */
export async function getProjectVersion(
  versionFlag: string | undefined,
  key: string,
  returnStable = false,
): Promise<string | undefined> {
  try {
    if (versionFlag) {
      return await readmeAPIv1Fetch(`/api/v1/version/${versionFlag}`, {
        method: 'get',
        headers: cleanAPIv1Headers(key),
      })
        .then(handleAPIv1Res)
        .then((res: Version) => res.version);
    }

    if (isCI()) {
      warn('No `--version` parameter detected in current CI environment. Defaulting to main version.');
      return undefined;
    }

    const versionList: Version[] = await readmeAPIv1Fetch('/api/v1/version', {
      method: 'get',
      headers: cleanAPIv1Headers(key),
    }).then(handleAPIv1Res);

    if (versionList.length === 1) {
      return versionList[0].version;
    }

    if (returnStable) {
      const stableVersion = versionList.find(v => v.is_stable === true);
      if (!stableVersion) {
        throw new Error('Unexpected version response from the ReadMe API. Get in touch with us at support@readme.io!');
      }
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
    return Promise.reject(new APIv1Error(err as APIv1ErrorResponse));
  }
}
