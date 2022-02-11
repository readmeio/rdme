const config = require('config');
const nock = require('nock');
const { getUserAgent } = require('../src/lib/fetch');

module.exports = function () {
  return nock(config.get('host'), {
    reqheaders: {
      'User-Agent': getUserAgent(),
    },
  });
};
