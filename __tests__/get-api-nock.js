const nock = require('nock');
const config = require('config');
const pkg = require('../package.json');

const gh = process.env.GITHUB_ACTIONS === 'true' ? '-github' : '';
const userAgent = `rdme${gh}/${pkg.version}`;

module.exports = function () {
  return nock(config.get('host'), {
    reqheaders: {
      'User-Agent': userAgent,
    },
  });
};

module.exports.userAgent = userAgent;
