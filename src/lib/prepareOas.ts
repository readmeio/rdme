import type { OpenAPI } from 'openapi-types';

import chalk from 'chalk';
import OASNormalize, { getAPIDefinitionType } from 'oas-normalize';
import ora from 'ora';

import isCI from './isCI';
import { debug, info, oraOptions } from './logger';
import promptTerminal from './promptWrapper';
import readdirRecursive from './readdirRecursive';

export type SpecFileType = OASNormalize['type'];

interface FoundSpecFile {
  /** path to the spec file */
  filePath: string;
  specType: 'OpenAPI' | 'Swagger' | 'Postman';
  /**
   * OpenAPI or Postman specification version
   * @example '3.1'
   */
  version: string;
}

interface FileSelection {
  file: string;
}

const capitalizeSpecType = (type: string) =>
  type === 'openapi' ? 'OpenAPI' : type.charAt(0).toUpperCase() + type.slice(1);

/**
 * Normalizes, validates, and (optionally) bundles an OpenAPI definition.
 *
 * @param path Path to a spec file. If this is missing, the current directory is searched for
 *    certain file names.
 * @param command The command context in which this is being run within (uploading a spec,
 *    validation, or reducing one).
 */
export default async function prepareOas(
  path: string,
  command: 'openapi' | 'openapi:convert' | 'openapi:inspect' | 'openapi:reduce' | 'openapi:validate',
  opts: {
    /**
     * Optionally convert the supplied or discovered API definition to the latest OpenAPI release.
     */
    convertToLatest?: boolean;
    /**
     * An optional title to replace the value in the `info.title` field.
     * @see {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#info-object}
     */
    title?: string;
  } = {
    convertToLatest: false,
  },
) {
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

    let action: 'convert' | 'inspect' | 'reduce' | 'upload' | 'validate';
    switch (command) {
      case 'openapi':
        action = 'upload';
        break;
      default:
        action = command.split(':')[1] as 'convert' | 'inspect' | 'reduce' | 'validate';
    }

    const jsonAndYamlFiles = readdirRecursive('.', true).filter(
      file =>
        file.toLowerCase().endsWith('.json') ||
        file.toLowerCase().endsWith('.yaml') ||
        file.toLowerCase().endsWith('.yml'),
    );

    debug(`number of JSON or YAML files found: ${jsonAndYamlFiles.length}`);

    const possibleSpecFiles: FoundSpecFile[] = (
      await Promise.all(
        jsonAndYamlFiles.map(file => {
          debug(`attempting to oas-normalize ${file}`);
          const oas = new OASNormalize(file, { enablePaths: true });
          return oas
            .version()
            .then(({ specification, version }) => {
              debug(`specification type for ${file}: ${specification}`);
              debug(`version for ${file}: ${version}`);
              return ['openapi', 'swagger', 'postman'].includes(specification)
                ? { filePath: file, specType: capitalizeSpecType(specification), version }
                : null;
            })
            .catch(e => {
              debug(`error extracting API definition specification version for ${file}: ${e.message}`);
              return null;
            });
        }),
      )
    ).filter(Boolean);

    debug(`number of possible OpenAPI/Swagger files found: ${possibleSpecFiles.length}`);

    if (!possibleSpecFiles.length) {
      fileFindingSpinner.fail();
      throw new Error(
        `We couldn't find an OpenAPI or Swagger definition.\n\nPlease specify the path to your definition with \`rdme ${command} ./path/to/api/definition\`.`,
      );
    }

    specPath = possibleSpecFiles[0].filePath;

    if (possibleSpecFiles.length === 1) {
      fileFindingSpinner.stop();
      info(chalk.yellow(`We found ${specPath} and are attempting to ${action} it.`));
    } else if (possibleSpecFiles.length > 1) {
      if (isCI()) {
        fileFindingSpinner.fail();
        throw new Error('Multiple API definitions found in current directory. Please specify file.');
      }

      fileFindingSpinner.stop();

      const selection: FileSelection = await promptTerminal({
        name: 'file',
        message: `Multiple potential API definitions found! Which one would you like to ${action}?`,
        type: 'select',
        choices: possibleSpecFiles.map(file => ({
          title: file.filePath,
          value: file.filePath,
          description: `${file.specType} ${file.version}`,
        })),
      });

      specPath = selection.file;
    }
  }

  const spinner = ora({ text: `Validating the API definition located at ${specPath}...`, ...oraOptions() }).start();

  debug(`about to normalize spec located at ${specPath}`);
  const oas = new OASNormalize(specPath, { colorizeErrors: true, enablePaths: true });
  debug('spec normalized');

  // We're retrieving the original specification type here instead of after validation because if
  // they give us a Postman collection we should tell them that we handled a Postman collection, not
  // an OpenAPI definition (eventhough we'll actually convert it to OpenAPI under the hood).
  //
  // And though `.validate()` will run `.load()` itself running `.load()` here will not have any
  // performance implications as `oas-normalizes` caches the result of `.load()` the first time you
  // run it.
  const { specType, definitionVersion } = await oas.load().then(async schema => {
    const type = getAPIDefinitionType(schema);
    return {
      specType: capitalizeSpecType(type),
      definitionVersion: await oas.version(),
    };
  });

  // If we were supplied a Postman collection this will **always** convert it to OpenAPI 3.0.
  let api: OpenAPI.Document = await oas.validate({ convertToLatest: opts.convertToLatest }).catch((err: Error) => {
    spinner.fail();
    debug(`raw validation error object: ${JSON.stringify(err)}`);
    throw err;
  });
  spinner.stop();

  debug('👇👇👇👇👇 spec validated! logging spec below 👇👇👇👇👇');
  debug(api);
  debug('👆👆👆👆👆 finished logging spec 👆👆👆👆👆');
  debug(`spec type: ${specType}`);

  if (opts.title) {
    debug(`renaming title field to ${opts.title}`);
    api.info.title = opts.title;
  }

  const specFileType = oas.type;

  // No need to optional chain here since `info.version` is required to pass validation
  const specVersion: string = api.info.version;
  debug(`version in spec: ${specVersion}`);

  if (['openapi', 'openapi:inspect', 'openapi:reduce'].includes(command)) {
    api = await oas.bundle();

    debug('spec bundled');
  }

  return {
    preparedSpec: JSON.stringify(api),
    /** A string indicating whether the spec file is a local path, a URL, etc. */
    specFileType,
    /** The path/URL to the spec file */
    specPath,
    /** A string indicating whether the spec file is OpenAPI, Swagger, etc. */
    specType,
    /**
     * The `info.version` field, extracted from the normalized spec.
     * This is **not** the OpenAPI version (e.g., 3.1, 3.0),
     * this is a user input that we use to specify the version in ReadMe
     * (if they use the `useSpecVersion` flag)
     */
    specVersion,
    /**
     * This is the `openapi`, `swagger`, or `postman` specification version of their API definition.
     */
    definitionVersion,
  };
}
