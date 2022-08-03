const path = require('path');

/**
 * We have to do this otherwise `require('config')` loads from the cwd where the user is running
 * `rdme` which wont be what we want.
 *
 * This file also has a CJS extension because the `config` library uses `require()` calls and
 * because `rdme` has `type: module` in its `package.json` Node wants **everything** to use
 * `import`.
 */
const configDir = process.env.NODE_CONFIG_DIR;
process.env.NODE_CONFIG_DIR = path.join(__dirname, '../../config');

const config = require('config');

process.env.NODE_CONFIG_DIR = configDir;

module.exports = config;
