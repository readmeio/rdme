import config from 'config';
import nock from 'nock';

import { getUserAgent } from '../../src/lib/fetch';

export default function getAPIMock(reqHeaders = {}) {
  return nock(config.get('host'), {
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
