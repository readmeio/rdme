import type { Headers } from 'node-fetch';

import nock from 'nock';

import config from '../../src/lib/config.js';
import { getUserAgent } from '../../src/lib/readmeAPIFetch.js';

/**
 * A type describing a raw object of request headers.
 * We use this in our API request mocking to validate that the request
 * contains all the expected headers.
 */
type ReqHeaders = Record<string, unknown>;

/**
 * Nock wrapper that adds required `user-agent` request header
 * so it gets properly picked up by nock.
 * @param proxy Optional proxy URL. Must contain trailing slash.
 */
export default function getAPIMock(reqHeaders = {}, proxy = '') {
  return nock(`${proxy}${config.host}`, {
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

function validateHeaders(headers: Headers, basicAuthUser: string, expectedReqHeaders: ReqHeaders) {
  // validate all headers in expectedReqHeaders
  Object.keys(expectedReqHeaders).forEach(reqHeaderKey => {
    if (headers.get(reqHeaderKey) !== expectedReqHeaders[reqHeaderKey]) {
      throw new Error(
        `Expected the request header '${expectedReqHeaders[reqHeaderKey]}', received '${headers.get(reqHeaderKey)}'`,
      );
    }
  });

  // validate basic auth header
  if (basicAuthUser) {
    const encodedApiKey = headers.get('Authorization').split(' ')[1];
    const decodedApiKey = Buffer.from(encodedApiKey, 'base64').toString();
    if (decodedApiKey !== `${basicAuthUser}:`) {
      throw new Error(`Expected API key '${basicAuthUser}', received '${decodedApiKey}'`);
    }
  }

  const userAgent = headers.get('user-agent');
  if (userAgent !== getUserAgent()) {
    throw new Error(`Expected user agent '${getUserAgent()}', received '${userAgent}'`);
  }
}
