const Configstore = require('configstore');
const pkg = require('../../package.json');

module.exports = new Configstore(`${pkg.name}-${process.env.NODE_ENV || 'production'}`);
