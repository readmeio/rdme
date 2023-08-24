import type { Headers } from 'headers-polyfill';

import config from 'config';
import { rest } from 'msw';
import nock from 'nock';

import { getUserAgent } from '../../src/lib/readmeAPIFetch';

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

function doHeadersMatch(headers: Headers) {
  // const auth = headers.get('authorization');
  // const decodedAuth = auth ? Buffer.from(auth.replace(/^Basic /, ''), 'base64').toString('ascii') : '';
  const userAgent = headers.get('user-agent');
  return userAgent === getUserAgent();
}

//   } = { method: 'get', path: '', status: 200, proxy: '' },

// TODO: add ability to check for other headers
export function getAPIMockMSW(
  path: string = '',
  method: keyof typeof rest = 'get',
  status = 200,
  response?: { json?: unknown; text?: string },
  proxy = '',
) {
  return rest[method](`${proxy}${config.get('host')}${path}`, (req, res, ctx) => {
    if (doHeadersMatch(req.headers)) {
      return res(ctx.status(status), ctx.json(response.json));
    }
    return res(ctx.status(500));
  });
}
