/* eslint-disable no-param-reassign */
const fetch = require('node-fetch');
const pkg = require('../../package.json');
const APIError = require('./apiError');

/**
 * Wrapper for the `fetch` API so we can add an rdme user agent to all API requests.
 *
 */
module.exports = (url, options = {}) => {
  if (!options.headers) {
    options.headers = {
      'User-Agent': module.exports.getUserAgent(),
    };
  } else {
    options.headers['User-Agent'] = module.exports.getUserAgent();
  }

  return fetch(url, options);
};

/**
 * Getter function for a string to be used in the user-agent header
 * based on the current environment.
 *
 */
module.exports.getUserAgent = function getUserAgent() {
  const gh = process.env.GITHUB_ACTIONS === 'true' ? '-github' : '';
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
