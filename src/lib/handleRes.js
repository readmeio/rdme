const APIError = require('./apiError');

async function handleRes(res) {
  const body = await res.json();
  if (body.error) {
    return Promise.reject(new APIError(body));
  }
  return body;
}

module.exports = { handleRes };
