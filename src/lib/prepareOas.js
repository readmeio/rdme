const OASNormalize = require('oas-normalize');
const { debug } = require('./logger');

/**
 * Normalizes, validates, and (optionally) bundles an OpenAPI definition.
 *
 * @param {String} path path to spec file
 * @param {Boolean} bundle boolean to indicate whether or not to
 * return a bundled spec (defaults to false)
 */
module.exports = async function prepare(path, bundle = false) {
  debug(`about to normalize spec located at ${path}`);
  const oas = new OASNormalize(path, { colorizeErrors: true, enablePaths: true });
  debug('spec normalized');

  const api = await oas.validate(false).catch(err => {
    debug(`raw validation error object: ${JSON.stringify(err)}`);
    throw err;
  });
  debug('spec validated');

  const specType = api.swagger ? 'Swagger' : 'OpenAPI';
  debug(`spec type: ${specType}`);

  let bundledSpec = '';

  if (bundle) {
    bundledSpec = await oas.bundle().then(res => {
      return JSON.stringify(res);
    });
    debug('spec bundled');
  }

  return { bundledSpec, specType };
};
