const { debug } = require('./logger');
const OASNormalize = require('oas-normalize');
const ora = require('ora');

const testing = process.env.NODE_ENV === 'testing';

/**
 * Normalizes, validates, and (optionally) bundles an OpenAPI definition.
 *
 * @param {String} path path to spec file
 * @param {Boolean} bundle boolean to indicate whether or not to
 * return a bundled spec (defaults to false)
 */
module.exports = async function prepare(path, bundle = false) {
  const text = `Validating API definition located at ${path}...`;
  const spinner = ora({ isSilent: testing, text }).start();

  debug(`about to normalize spec located at ${path}`);
  const oas = new OASNormalize(path, { colorizeErrors: true, enablePaths: true });
  debug('spec normalized');

  const api = await oas.validate(false).catch(err => {
    spinner.fail();
    debug(`raw validation error object: ${JSON.stringify(err)}`);
    throw err;
  });
  spinner.succeed(`${text} done!`);

  debug('👇👇👇👇👇 spec validated! logging spec below 👇👇👇👇👇');
  debug(api);
  debug('👆👆👆👆👆 finished logging spec 👆👆👆👆👆');

  const specType = api.swagger ? 'Swagger' : 'OpenAPI';
  debug(`spec type: ${specType}`);

  let bundledSpec = '';

  if (bundle) {
    bundledSpec = await oas
      .bundle()
      .then(res => {
        return JSON.stringify(res);
      })
      .catch(err => {
        debug(`raw bundling error object: ${JSON.stringify(err)}`);
        throw err;
      });
    debug('spec bundled');
  }

  return { bundledSpec, specType };
};
