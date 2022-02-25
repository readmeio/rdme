/* eslint-disable no-param-reassign */
const { debug } = require('./logger');
const fetch = require('node-fetch');
const isGHA = require('./isGitHub');
const pkg = require('../../package.json');
const APIError = require('./apiError');

/**
 * Wrapper for the `fetch` API so we can add rdme-specific headers to all API requests.
 *
 */
module.exports = (url, options = { headers: {} }) => {
  let source = 'cli';

  options.headers['User-Agent'] = module.exports.getUserAgent();

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

  return fetch(url, options);
};

/**
 * Getter function for a string to be used in the user-agent header
 * based on the current environment.
 *
 */
module.exports.getUserAgent = function getUserAgent() {
  const gh = isGHA() ? '-github' : '';
  return `rdme${gh}/${pkg.version}`;
};

/**
 * Small handler for transforming responses from our API into JSON and if there's errors, throwing
 * an APIError exception.
 *
 * @param {Response} res
 */
module.exports.handleRes = async function handleRes(res) {
  const body = await res.json();
  debug(`received status code ${res.status} with response body: ${JSON.stringify(body)}`);
  if (body.error) {
    return Promise.reject(new APIError(body));
  }
  return body;
};

/**
 * Returns the basic auth header and any other defined headers for use in node-fetch API calls.
 *
 * @param {string} key The ReadMe project API key
 * @param {Object} inputHeaders Any additional headers to be cleaned
 * @returns An object with cleaned request headers for usage in the node-fetch requests to the ReadMe API.
 */
module.exports.cleanHeaders = function cleanHeaders(key, inputHeaders = {}) {
  const encodedKey = Buffer.from(`${key}:`).toString('base64');
  const headers = {
    Authorization: `Basic ${encodedKey}`,
  };

  Object.keys(inputHeaders).forEach(header => {
    // For some reason, node-fetch will send in the string 'undefined'
    // if you pass in an undefined value for a header,
    // so that's why headers are added incrementally.
    if (typeof inputHeaders[header] === 'string') headers[header] = inputHeaders[header];
  });

  return headers;
};
