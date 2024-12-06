import nock from 'nock';

import config from '../../src/lib/config.js';
import { getUserAgent } from '../../src/lib/readmeAPIFetch.js';

/**
 * Nock wrapper for ReadMe API v1 that adds required
 * `user-agent` request header so it gets properly picked up by nock.
 */
export function getAPIV1Mock(reqHeaders = {}) {
  return nock(config.host.v1, {
    reqheaders: {
      'User-Agent': getUserAgent(),
      ...reqHeaders,
    },
  });
}

export function getAPIV1MockWithVersionHeader(v: string) {
  return getAPIV1Mock({
    'x-readme-version': v,
  });
}
