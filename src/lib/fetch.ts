/* eslint-disable no-param-reassign */
import type { Headers } from 'form-data';
import type { BodyInit, Response } from 'node-fetch';

import mime from 'mime-types';
import nodeFetch from 'node-fetch';

import pkg from '../../package.json';

import APIError from './apiError';
import isGHA from './isGitHub';
import { debug } from './logger';

/**
 * Getter function for a string to be used in the user-agent header
 * based on the current environment.
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
export default function fetch(
  url: string,
  options: { body?: BodyInit; headers?: Headers; method?: string } = { headers: {} }
) {
  let source = 'cli';

  options.headers['User-Agent'] = getUserAgent();

  if (isGHA()) {
    source = 'cli-gh';
    options.headers['x-github-repository'] = process.env.GITHUB_REPOSITORY;
    options.headers['x-github-run-attempt'] = process.env.GITHUB_RUN_ATTEMPT;
    options.headers['x-github-run-id'] = process.env.GITHUB_RUN_ID;
    options.headers['x-github-run-number'] = process.env.GITHUB_RUN_NUMBER;
    options.headers['x-github-sha'] = process.env.GITHUB_SHA;
  }

  options.headers['x-readme-source'] = source;

  debug(`making ${(options.method || 'get').toUpperCase()} request to ${url}`);

  return nodeFetch(url, options);
}

/**
 * Small handler for handling responses from our API.
 *
 * If we receive JSON errors, we throw an APIError exception.
 *
 * If we receive non-JSON responses, we consider them errors and throw them.
 *
 * @param {Response} res
 */
async function handleRes(res: Response) {
  const contentType = res.headers.get('content-type');
  const extension = mime.extension(contentType);
  if (extension === 'json') {
    const body = await res.json();
    debug(`received status code ${res.status} from ${res.url} with JSON response: ${JSON.stringify(body)}`);
    if (body.error) {
      return Promise.reject(new APIError(body));
    }
    return body;
  }
  // If we receive a non-JSON response, it's likely an error.
  // Let's debug the raw response body and throw it.
  const body = await res.text();
  debug(`received status code ${res.status} from ${res.url} with non-JSON response: ${body}`);
  return Promise.reject(body);
}

/**
 * Returns the basic auth header and any other defined headers for use in node-fetch API calls.
 *
 * @param {string} key The ReadMe project API key
 * @param {Object} inputHeaders Any additional headers to be cleaned
 * @returns An object with cleaned request headers for usage in the node-fetch requests to the ReadMe API.
 */
function cleanHeaders(key: string, inputHeaders: Headers = {}) {
  const encodedKey = Buffer.from(`${key}:`).toString('base64');
  const headers: Record<string, string> = {
    Authorization: `Basic ${encodedKey}`,
  };

  Object.keys(inputHeaders).forEach(header => {
    // For some reason, node-fetch will send in the string 'undefined'
    // if you pass in an undefined value for a header,
    // so that's why headers are added incrementally.
    if (typeof inputHeaders[header] === 'string') headers[header] = inputHeaders[header];
  });

  return headers;
}

export { cleanHeaders, getUserAgent, handleRes };
