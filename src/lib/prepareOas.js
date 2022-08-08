const chalk = require('chalk');
const fs = require('fs');
const OASNormalize = require('oas-normalize');
const ora = require('ora');

const { debug, info, oraOptions } = require('./logger');

/**
 * Normalizes, validates, and (optionally) bundles an OpenAPI definition.
 *
 * @param {String} path path to spec file. if this is missing, the current directory is searched
 * for certain file names
 * @param {('openapi'|'validate')} command string to distinguish if it's being run in
 * an 'openapi' or 'validate' context
 */
module.exports = async function prepare(path, command) {
  let specPath = path;

  if (!specPath) {
    // If the user didn't supply an API specification, let's try to locate what they've got, and validate that. If they
    // don't have any, let's let the user know how they can get one going.
    specPath = await new Promise((resolve, reject) => {
      ['swagger.json', 'swagger.yaml', 'swagger.yml', 'openapi.json', 'openapi.yaml', 'openapi.yml'].forEach(file => {
        debug(`looking for definition with filename: ${file}`);
        if (!fs.existsSync(file)) {
          debug(`${file} not found`);
          return;
        }

        info(
          chalk.yellow(`We found ${file} and are attempting to ${command === 'openapi' ? 'upload' : 'validate'} it.`)
        );
        resolve(file);
      });

      reject(
        new Error(
          `We couldn't find an OpenAPI or Swagger definition.\n\nPlease specify the path to your definition with \`rdme ${command} ./path/to/api/definition\`.`
        )
      );
    });
  }

  const spinner = ora({ text: `Validating API definition located at ${specPath}...`, ...oraOptions() }).start();

  debug(`about to normalize spec located at ${specPath}`);
  const oas = new OASNormalize(specPath, { colorizeErrors: true, enablePaths: true });
  debug('spec normalized');

  const api = await oas.validate(false).catch(err => {
    spinner.fail();
    debug(`raw validation error object: ${JSON.stringify(err)}`);
    throw err;
  });
  spinner.succeed(`${spinner.text} done! ✅`);

  debug('👇👇👇👇👇 spec validated! logging spec below 👇👇👇👇👇');
  debug(api);
  debug('👆👆👆👆👆 finished logging spec 👆👆👆👆👆');

  const specType = api.swagger ? 'Swagger' : 'OpenAPI';
  debug(`spec type: ${specType}`);

  const specVersion = api?.info?.version;
  debug(`version in spec: ${specVersion}`);

  let bundledSpec = '';

  if (command === 'openapi') {
    bundledSpec = await oas.bundle().then(res => {
      return JSON.stringify(res);
    });

    debug('spec bundled');
  }

  return { bundledSpec, specPath, specType, specVersion };
};
