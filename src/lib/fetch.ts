import type { RequestInit, Response } from 'node-fetch';

import mime from 'mime-types';
// eslint-disable-next-line no-restricted-imports
import nodeFetch, { Headers } from 'node-fetch';

import pkg from '../../package.json';

import APIError from './apiError';
import { isGHA } from './isCI';
import { debug, warn } from './logger';

const SUCCESS_NO_CONTENT = 204;

function getProxy() {
  // this is something of an industry standard env var, hence the checks for different casings
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) {
    // adds trailing slash
    return proxy.endsWith('/') ? proxy : `${proxy}/`;
  }
  return '';
}

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Warning}
 * @see {@link https://www.rfc-editor.org/rfc/rfc7234#section-5.5}
 * @see {@link https://github.com/marcbachmann/warning-header-parser}
 */
interface WarningHeader {
  code: string;
  agent: string;
  message: string;
  date?: string;
}

function stripQuotes(s: string) {
  if (!s) return '';
  return s.replace(/(^"|[",]*$)/g, '');
}

/**
 * Parses Warning header into an array of warning header objects
 * @param header raw `Warning` header
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Warning}
 * @see {@link https://www.rfc-editor.org/rfc/rfc7234#section-5.5}
 * @see {@link https://github.com/marcbachmann/warning-header-parser}
 */
function parseWarningHeader(header: string): WarningHeader[] {
  try {
    const warnings = header.split(/([0-9]{3} [a-z0-9.@\-/]*) /g);

    let previous: WarningHeader;

    return warnings.reduce((all, w) => {
      // eslint-disable-next-line no-param-reassign
      w = w.trim();
      const newError = w.match(/^([0-9]{3}) (.*)/);
      if (newError) {
        previous = { code: newError[1], agent: newError[2], message: '' };
      } else if (w) {
        const errorContent = w.split(/" "/);
        if (errorContent) {
          previous.message = stripQuotes(errorContent[0]);
          previous.date = stripQuotes(errorContent[1]);
          all.push(previous);
        }
      }
      return all;
    }, []);
  } catch (e) {
    debug(`error parsing warning header: ${e.message}`);
    return [{ code: '199', agent: '-', message: header }];
  }
}

/**
 * Getter function for a string to be used in the user-agent header based on the current
 * environment.
 *
 */
function getUserAgent() {
  const gh = isGHA() ? '-github' : '';
  return `rdme${gh}/${pkg.version}`;
}

/**
 * Wrapper for the `fetch` API so we can add rdme-specific headers to all API requests.
 *
 */
export default function fetch(url: string, options: RequestInit = { headers: new Headers() }) {
  let source = 'cli';
  let headers = options.headers as Headers;

  if (!(options.headers instanceof Headers)) {
    headers = new Headers(options.headers);
  }

  headers.set('User-Agent', getUserAgent());

  if (isGHA()) {
    source = 'cli-gh';
    headers.set('x-github-repository', process.env.GITHUB_REPOSITORY);
    headers.set('x-github-run-attempt', process.env.GITHUB_RUN_ATTEMPT);
    headers.set('x-github-run-id', process.env.GITHUB_RUN_ID);
    headers.set('x-github-run-number', process.env.GITHUB_RUN_NUMBER);
    headers.set('x-github-sha', process.env.GITHUB_SHA);
  }

  headers.set('x-readme-source', source);

  const fullUrl = `${getProxy()}${url}`;

  debug(`making ${(options.method || 'get').toUpperCase()} request to ${fullUrl}`);

  return nodeFetch(fullUrl, {
    ...options,
    headers,
  }).then(res => {
    const warningHeader = res.headers.get('Warning');
    if (warningHeader) {
      debug(`received warning header: ${warningHeader}`);
      const warnings = parseWarningHeader(warningHeader);
      warnings.forEach(warning => {
        warn(warning.message, 'ReadMe API Warning:');
      });
    }
    return res;
  });
}

/**
 * Small handler for handling responses from our API.
 *
 * If we receive JSON errors, we throw an APIError exception.
 *
 * If we receive non-JSON responses, we consider them errors and throw them.
 *
 * @param rejectOnJsonError if omitted (or set to true), the function will return
 * an `APIError` if the JSON body contains an `error` property. If set to false,
 * the function will return a resolved promise containing the JSON object.
 *
 */
async function handleRes(res: Response, rejectOnJsonError = true) {
  const contentType = res.headers.get('content-type');
  const extension = mime.extension(contentType);
  if (extension === 'json') {
    const body = await res.json();
    debug(`received status code ${res.status} from ${res.url} with JSON response: ${JSON.stringify(body)}`);
    if (body.error && rejectOnJsonError) {
      return Promise.reject(new APIError(body));
    }
    return body;
  }
  if (res.status === SUCCESS_NO_CONTENT) {
    debug(`received status code ${res.status} from ${res.url} with no content`);
    return {};
  }
  // If we receive a non-JSON response, it's likely an error.
  // Let's debug the raw response body and throw it.
  const body = await res.text();
  debug(`received status code ${res.status} from ${res.url} with non-JSON response: ${body}`);
  return Promise.reject(body);
}

/**
 * Returns the basic auth header and any other defined headers for use in `node-fetch` API calls.
 *
 */
function cleanHeaders(key: string, inputHeaders: Headers = new Headers()) {
  const encodedKey = Buffer.from(`${key}:`).toString('base64');
  const headers = new Headers({
    Authorization: `Basic ${encodedKey}`,
  });

  for (const header of inputHeaders.entries()) {
    // If you supply `undefined` or `null` to the `Headers` API it'll convert that those to a
    // string.
    if (header[1] !== 'null' && header[1] !== 'undefined' && header[1].length > 0) {
      headers.set(header[0], header[1]);
    }
  }

  return headers;
}

export { cleanHeaders, getUserAgent, handleRes };
