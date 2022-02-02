const nock = require('nock');
const config = require('config');
const pkg = require('../package.json');

const userAgent = `rdme/${pkg.version}`;

module.exports = function () {
  return nock(config.get('host'), {
    reqheaders: {
      'User-Agent': userAgent,
    },
  });
};

module.exports.userAgent = userAgent;
