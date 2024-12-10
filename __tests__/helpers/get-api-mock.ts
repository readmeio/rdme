import nock from 'nock';

import config from '../../src/lib/config.js';
import { getUserAgent } from '../../src/lib/readmeAPIFetch.js';

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

export function getAPIv1MockWithVersionHeader(v: string) {
  return getAPIv1Mock({
    'x-readme-version': v,
  });
}
