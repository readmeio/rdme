import type { SpecFileType } from './prepareOas.js';

import path from 'node:path';

import mime from 'mime-types';
import { ProxyAgent } from 'undici';

import { APIv1Error } from './apiError.js';
import config from './config.js';
import { getPkgVersion } from './getPkg.js';
import { git } from './git.js';
import isCI, { ciName, isGHA } from './isCI.js';
import { debug, warn } from './logger.js';

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
  return process.env.HTTPS_PROXY || process.env.https_proxy;
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
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Warning}
 * @see {@link https://www.rfc-editor.org/rfc/rfc7234#section-5.5}
 * @see {@link https://github.com/marcbachmann/warning-header-parser}
 */
function parseWarningHeader(
  /** The raw `Warning` header string */
  header: string,
): WarningHeader[] {
  try {
    const warnings = header.split(/([0-9]{3} [a-z0-9.@\-/]*) /g);

    let previous: WarningHeader;

    return warnings.reduce<WarningHeader[]>((all, w) => {
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
export function getUserAgent() {
  const gh = isGHA() ? '-github' : '';
  return `rdme${gh}/${getPkgVersion()}`;
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
  const raw = Array.from(headers.entries()).reduce<Record<string, string>>((prev, current) => {
    // eslint-disable-next-line no-param-reassign
    prev[current[0]] = current[0].toLowerCase() === 'authorization' ? 'redacted' : current[1];
    return prev;
  }, {});
  return JSON.stringify(raw);
}

/**
 * Wrapper for the `fetch` API so we can add rdme-specific headers to all ReadMe API v1 requests.
 *
 * @deprecated This is for APIv1 only. Use {@link readmeAPIv2Fetch} instead, if possible.
 */
export async function readmeAPIv1Fetch(
  /** The pathname to make the request to. Must have a leading slash. */
  pathname: string,
  options: RequestInit = { headers: new Headers() },
  /** optional object containing information about the file being sent.
   * We use this to construct a full source URL for the file. */
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
    if (process.env.GITHUB_REPOSITORY) headers.set('x-github-repository', process.env.GITHUB_REPOSITORY);
    if (process.env.GITHUB_RUN_ATTEMPT) headers.set('x-github-run-attempt', process.env.GITHUB_RUN_ATTEMPT);
    if (process.env.GITHUB_RUN_ID) headers.set('x-github-run-id', process.env.GITHUB_RUN_ID);
    if (process.env.GITHUB_RUN_NUMBER) headers.set('x-github-run-number', process.env.GITHUB_RUN_NUMBER);
    if (process.env.GITHUB_SHA) headers.set('x-github-sha', process.env.GITHUB_SHA);

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

  const fullUrl = `${config.host}${pathname}`;
  const proxy = getProxy();

  debug(
    `making ${(options.method || 'get').toUpperCase()} request to ${fullUrl} ${proxy ? `with proxy ${proxy} and ` : ''}with headers: ${sanitizeHeaders(headers)}`,
  );

  return fetch(fullUrl, {
    ...options,
    headers,
    // @ts-expect-error we need to clean up our undici usage here ASAP
    dispatcher: proxy ? new ProxyAgent(proxy) : undefined,
  })
    .then(res => {
      const warningHeader = res.headers.get('Warning');
      if (warningHeader) {
        debug(`received warning header: ${warningHeader}`);
        const warnings = parseWarningHeader(warningHeader);
        warnings.forEach(warning => {
          warn(warning.message, 'ReadMe API Warning:');
        });
      }
      return res;
    })
    .catch(e => {
      debug(`error making fetch request: ${e}`);
      throw e;
    });
}

/**
 * Small handler for handling responses from ReadMe API v1.
 *
 * If we receive JSON errors, we throw an APIv1Error exception.
 *
 * If we receive non-JSON responses, we consider them errors and throw them.
 *
 * @deprecated This is for APIv1 only. Use {@link handleAPIv2Res} instead, if possible.
 */
export async function handleAPIv1Res(
  res: Response,
  /**
   * If omitted (or set to true), the function will return an `APIv1Error`
   * if the JSON body contains an `error` property. If set to false,
   * the function will return a resolved promise containing the JSON object.
   */
  rejectOnJsonError = true,
) {
  const contentType = res.headers.get('content-type') || '';
  const extension = mime.extension(contentType);
  if (extension === 'json') {
    // TODO: type this better
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await res.json()) as any;
    debug(`received status code ${res.status} from ${res.url} with JSON response: ${JSON.stringify(body)}`);
    if (body.error && rejectOnJsonError) {
      return Promise.reject(new APIv1Error(body));
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
 * If you supply `undefined` or `null` to the `Headers` API,
 * it'll convert those to a string by default,
 * so we instead filter those out here.
 */
function filterOutFalsyHeaders(inputHeaders: Headers) {
  const headers = new Headers();

  for (const header of inputHeaders.entries()) {
    if (header[1] !== 'null' && header[1] !== 'undefined' && header[1].length > 0) {
      headers.set(header[0], header[1]);
    }
  }

  return headers;
}

/**
 * Returns the basic auth header and any other defined headers for use in `fetch` calls against ReadMe API v1.
 *
 * @deprecated This is for APIv1 only.
 */
export function cleanAPIv1Headers(
  key: string,
  /** used for `x-readme-header` */
  version?: string,
  headers: Headers = new Headers(),
) {
  const encodedKey = Buffer.from(`${key}:`).toString('base64');
  headers.set('Authorization', `Basic ${encodedKey}`);

  if (version) {
    headers.set('x-readme-version', version);
  }

  return filterOutFalsyHeaders(headers);
}
