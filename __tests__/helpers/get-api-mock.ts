import nock from 'nock';

import config from '../../src/lib/config.js';
import { getUserAgent } from '../../src/lib/readmeAPIFetch.js';

import { mockVersion } from './oclif.js';

/**
 * Nock wrapper for ReadMe API v1 that adds required
 * `user-agent` request header so it gets properly picked up by nock.
 */
export function getAPIv1Mock(reqHeaders = {}) {
  return nock(config.host.v1, {
    reqheaders: {
      'User-Agent': getUserAgent(),
      ...reqHeaders,
    },
  });
}

/**
 * Nock wrapper for ReadMe API v2 that adds required
 * `user-agent` request header so it gets properly picked up by nock.
 */
export function getAPIv2Mock(reqHeaders: nock.Options['reqheaders'] = {}) {
  return nock(config.host.v2, {
    reqheaders: {
      'User-Agent': ua => ua.startsWith(`rdme/${mockVersion}`),
      'x-readme-source': 'cli',
      ...reqHeaders,
    },
  });
}

/**
 * Variant of `getAPIv2Mock` for mocking a GitHub Actions environment.
 */
export function getAPIv2MockForGHA(reqHeaders: nock.Options['reqheaders'] = {}) {
  return getAPIv2Mock({
    'User-Agent': ua => ua.startsWith(`rdme-github/${mockVersion}`),
    'x-readme-source': 'cli-gh',
    ...reqHeaders,
  });
}
