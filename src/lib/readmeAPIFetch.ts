import type { SpecFileType } from './prepareOas';
import type { RequestInit, Response } from 'node-fetch';

import path from 'path';

import config from 'config';
import mime from 'mime-types';
import nodeFetch, { Headers } from 'node-fetch'; // eslint-disable-line no-restricted-imports

import pkg from '../../package.json';

import APIError from './apiError';
import { git } from './createGHA';
import isCI, { ciName, isGHA } from './isCI';
import { debug, warn } from './logger';

const SUCCESS_NO_CONTENT = 204;

/**
 * This contains a few pieces of information about a file so
 * we can properly construct a source URL for it.
 */
interface FilePathDetails {
  /** The URL or local file path */
  filePath: string;
  /** This is derived from the `oas-normalize` `type` property. */
  fileType: SpecFileType;
}

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
  agent: string;
  code: string;
  date?: string;
  message: string;
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
 * Creates a relative path for the file from the root of the repo,
 * otherwise returns the path
 */
async function normalizeFilePath(opts: FilePathDetails) {
  if (opts.fileType === 'path') {
    const repoRoot = await git.revparse(['--show-toplevel']).catch(e => {
      debug(`[fetch] error grabbing git root: ${e.message}`);
      return '';
    });

    return path.relative(repoRoot, opts.filePath);
  }
  return opts.filePath;
}

/**
 * Sanitizes and stringifies the `Headers` object for logging purposes
 */
function sanitizeHeaders(headers: Headers) {
  const raw = new Headers(headers).raw();
  if (raw.Authorization) raw.Authorization = ['redacted'];
  return JSON.stringify(raw);
}

/**
 * Wrapper for the `fetch` API so we can add rdme-specific headers to all API requests.
 *
 * @param pathname the pathname to make the request to. Must have a leading slash.
 * @param fileOpts optional object containing information about the file being sent.
 * We use this to construct a full source URL for the file.
 */
export default async function readmeAPIFetch(
  pathname: string,
  options: RequestInit = { headers: new Headers() },
  fileOpts: FilePathDetails = { filePath: '', fileType: false },
) {
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

    const filePath = await normalizeFilePath(fileOpts);

    if (filePath) {
      /**
       * Constructs a full URL to the file using GitHub Actions runner variables
       * @see {@link https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables}
       * @example https://github.com/readmeio/rdme/blob/cb4129d5c7b51ff3b50f933a9c7d0c3d0d33d62c/documentation/rdme.md
       */
      try {
        const sourceUrl = new URL(
          `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/blob/${process.env.GITHUB_SHA}/${filePath}`,
        ).href;
        headers.set('x-readme-source-url', sourceUrl);
      } catch (e) {
        debug(`error constructing github source url: ${e.message}`);
      }
    }
  }

  if (isCI()) {
    headers.set('x-rdme-ci', ciName());
  }

  headers.set('x-readme-source', source);

  if (fileOpts.filePath && fileOpts.fileType === 'url') {
    headers.set('x-readme-source-url', fileOpts.filePath);
  }

  const fullUrl = `${getProxy()}${config.get('host')}${pathname}`;

  debug(
    `making ${(options.method || 'get').toUpperCase()} request to ${fullUrl} with headers: ${sanitizeHeaders(headers)}`,
  );

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
