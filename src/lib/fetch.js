/* eslint-disable no-param-reassign */
const fetch = require('node-fetch');
const pkg = require('../../package.json');
const APIError = require('./apiError');

/**
 * Wrapper for the `fetch` API so we can add an rdme user agent to all API requests.
 *
 */
module.exports = (url, options = {}) => {
  const userAgent = `rdme/${pkg.version}`;

  if (!options.headers) {
    options.headers = {
      'User-Agent': userAgent,
    };
  } else {
    options.headers['User-Agent'] = userAgent;
  }

  return fetch(url, options);
};

module.exports.handleRes = async function handleRes(res) {
  const body = await res.json();
  if (body.error) {
    return Promise.reject(new APIError(body));
  }
  return body;
};
