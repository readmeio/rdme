import chalk from 'chalk';
import OASNormalize from 'oas-normalize';
import ora from 'ora';

import isCI from './isCI';
import { debug, info, oraOptions } from './logger';
import promptTerminal from './promptWrapper';
import readdirRecursive from './readdirRecursive';

type FileSelection = {
  file: string;
};

/**
 * Normalizes, validates, and (optionally) bundles an OpenAPI definition.
 *
 * @param path Path to a spec file. If this is missing, the current directory is searched for
 *    certain file names.
 * @param command The command context in which this is being run within (uploading a spec,
 *    validation, or reducing one).
 */
export default async function prepareOas(path: string, command: 'openapi' | 'openapi:reduce' | 'validate') {
  let specPath = path;

  if (!specPath) {
    /**
     * Scans working directory for a potential OpenAPI or Swagger file.
     * Any files in the `.git` directory or defined in a top-level `.gitignore` file
     * are skipped.
     *
     * A "potential OpenAPI or Swagger file" is defined as a YAML or JSON file
     * that has an `openapi` or `swagger` property defined at the top-level.
     *
     * If multiple potential files are found, the user must select a single file.
     *
     * An error is thrown in the following cases:
     * - if in a CI environment and multiple files are found
     * - no files are found
     */

    const fileFindingSpinner = ora({ text: 'Looking for API definitions...', ...oraOptions() }).start();

    let action: 'upload' | 'reduce' | 'validate';
    switch (command) {
      case 'openapi':
        action = 'upload';
        break;
      case 'openapi:reduce':
        action = 'reduce';
        break;
      default:
        action = command;
    }

    const jsonAndYamlFiles = readdirRecursive('.', true).filter(
      file =>
        file.toLowerCase().endsWith('.json') ||
        file.toLowerCase().endsWith('.yaml') ||
        file.toLowerCase().endsWith('.yml')
    );

    debug(`number of JSON or YAML files found: ${jsonAndYamlFiles.length}`);

    const possibleSpecFiles = (
      await Promise.all(
        jsonAndYamlFiles.map(file => {
          debug(`attempting to oas-normalize ${file}`);
          const oas = new OASNormalize(file, { enablePaths: true });
          return oas
            .version()
            .then(version => {
              debug(`OpenAPI/Swagger version for ${file}: ${version}`);
              return version ? file : '';
            })
            .catch(e => {
              debug(`error extracting OpenAPI/Swagger version for ${file}: ${e.message}`);
              return '';
            });
        })
      )
    ).filter(Boolean);

    debug(`number of possible OpenAPI/Swagger files found: ${possibleSpecFiles.length}`);

    if (!possibleSpecFiles.length) {
      fileFindingSpinner.fail();
      throw new Error(
        `We couldn't find an OpenAPI or Swagger definition.\n\nPlease specify the path to your definition with \`rdme ${command} ./path/to/api/definition\`.`
      );
    }

    specPath = possibleSpecFiles[0];

    if (possibleSpecFiles.length === 1) {
      fileFindingSpinner.succeed(`${fileFindingSpinner.text} found! 🔍`);
      info(chalk.yellow(`We found ${specPath} and are attempting to ${action} it.`));
    } else if (possibleSpecFiles.length > 1) {
      if (isCI()) {
        fileFindingSpinner.fail();
        throw new Error('Multiple API definitions found in current directory. Please specify file.');
      }

      fileFindingSpinner.succeed(`${fileFindingSpinner.text} found! 🔍`);

      const selection: FileSelection = await promptTerminal({
        name: 'file',
        message: `Multiple potential API definitions found! Which one would you like to ${action}?`,
        type: 'select',
        choices: possibleSpecFiles.map(file => ({ title: file, value: file })),
      });

      specPath = selection.file;
    }
  }

  const spinner = ora({ text: `Validating the API definition located at ${specPath}...`, ...oraOptions() }).start();

  debug(`about to normalize spec located at ${specPath}`);
  const oas = new OASNormalize(specPath, { colorizeErrors: true, enablePaths: true });
  debug('spec normalized');

  const api = await oas.validate(false).catch((err: Error) => {
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

  // No need to optional chain here since `info.version` is required to pass validation
  const specVersion = api.info.version;
  debug(`version in spec: ${specVersion}`);

  let bundledSpec = '';

  if (command === 'openapi' || command === 'openapi:reduce') {
    bundledSpec = await oas.bundle().then(res => {
      return JSON.stringify(res);
    });

    debug('spec bundled');
  }

  return { bundledSpec, specPath, specType, specVersion };
}
