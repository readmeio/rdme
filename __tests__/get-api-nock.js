import config from 'config';
import nock from 'nock';
import { getUserAgent } from '../src/lib/fetch.js';

export default function getAPINock(reqHeaders = {}) {
  return nock(config.get('host'), {
    reqheaders: {
      'User-Agent': getUserAgent(),
      ...reqHeaders,
    },
  });
}
