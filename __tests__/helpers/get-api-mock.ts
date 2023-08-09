import config from 'config';
import nock from 'nock';

import { getUserAgent } from '../../src/lib/readmeAPIFetch.js';

/**
 * Nock wrapper that adds required `user-agent` request header
 * so it gets properly picked up by nock.
 * @param proxy Optional proxy URL. Must contain trailing slash.
 */
export default function getAPIMock(reqHeaders = {}, proxy = '') {
  return nock(`${proxy}${config.get('host')}`, {
    reqheaders: {
      'User-Agent': getUserAgent(),
      ...reqHeaders,
    },
  });
}

export function getAPIMockWithVersionHeader(v: string) {
  return getAPIMock({
    'x-readme-version': v,
  });
}
