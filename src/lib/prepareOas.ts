import type { OpenAPI } from 'openapi-types';
import type { CommandIdForTopic, OpenAPICommands } from '../index.js';

import chalk from 'chalk';
import OASNormalize from 'oas-normalize';
import { getAPIDefinitionType } from 'oas-normalize/lib/utils';
import ora from 'ora';

import isCI from './isCI.js';
import { oraOptions } from './logger.js';
import promptTerminal from './promptWrapper.js';
import readdirRecursive from './readdirRecursive.js';

export type SpecFileType = OASNormalize['type'];

type SpecType = 'OpenAPI' | 'Postman' | 'Swagger';

interface FoundSpecFile {
  /** path to the spec file */
  filePath: string;
  specType: SpecType;
  /**
   * OpenAPI or Postman specification version
   * @example '3.1'
   */
  version: string;
}

interface FileSelection {
  file: string;
}

// source: https://stackoverflow.com/a/58110124
type Truthy<T> = T extends '' | 0 | false | null | undefined ? never : T;

function truthy<T>(value: T): value is Truthy<T> {
  return !!value;
}

type OpenAPIAction = CommandIdForTopic<'openapi'>;

function capitalizeSpecType<T extends 'openapi' | 'postman' | 'swagger' | 'unknown'>(
  type: T,
): T extends 'openapi' ? 'OpenAPI' : Capitalize<T> {
  // biome-ignore lint/suspicious/noExplicitAny: Casting to `any` makes this properly narrow.
  return (type === 'openapi' ? 'OpenAPI' : type.charAt(0).toUpperCase() + type.slice(1)) as any;
}

/**
 * Normalizes, validates, and (optionally) bundles an OpenAPI definition.
 */
export default async function prepareOas(
  this: OpenAPICommands,
  /**
   * The command context in which this is being run within (uploading a spec,
   * validation, or reducing one).
   */
  command: `openapi ${OpenAPIAction}`,
) {
  let specPath = this.args.spec;

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

    const action: OpenAPIAction = command.replace('openapi ', '') as OpenAPIAction;

    const jsonAndYamlFiles = readdirRecursive('.', true).filter(
      file =>
        file.toLowerCase().endsWith('.json') ||
        file.toLowerCase().endsWith('.yaml') ||
        file.toLowerCase().endsWith('.yml'),
    );

    this.debug(`number of JSON or YAML files found: ${jsonAndYamlFiles.length}`);

    const possibleSpecFiles: FoundSpecFile[] = (
      await Promise.all(
        jsonAndYamlFiles.map(file => {
          this.debug(`attempting to oas-normalize ${file}`);
          const oas = new OASNormalize(file, { enablePaths: true });
          return oas
            .version()
            .then(({ specification, version }) => {
              this.debug(`specification type for ${file}: ${specification}`);
              this.debug(`version for ${file}: ${version}`);
              return ['openapi', 'swagger', 'postman'].includes(specification)
                ? { filePath: file, specType: capitalizeSpecType(specification) as SpecType, version }
                : null;
            })
            .catch(e => {
              this.debug(`error extracting API definition specification version for ${file}: ${e.message}`);
              return null;
            });
        }),
      )
    ).filter(truthy);

    this.debug(`number of possible OpenAPI/Swagger files found: ${possibleSpecFiles.length}`);

    if (!possibleSpecFiles.length) {
      fileFindingSpinner.fail();
      throw new Error(
        `We couldn't find an OpenAPI or Swagger definition.\n\nPlease specify the path to your definition with \`rdme ${command} ./path/to/api/definition\`.`,
      );
    }

    specPath = possibleSpecFiles[0].filePath;

    if (possibleSpecFiles.length === 1) {
      fileFindingSpinner.stop();
      this.info(chalk.yellow(`We found ${specPath} and are attempting to ${action} it.`));
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

  this.debug(`about to normalize spec located at ${specPath}`);
  const oas = new OASNormalize(specPath, { colorizeErrors: true, enablePaths: true });
  this.debug('spec normalized');

  // We're retrieving the original specification type here instead of after validation because if
  // they give us a Postman collection we should tell them that we handled a Postman collection, not
  // an OpenAPI definition (eventhough we'll actually convert it to OpenAPI under the hood).
  //
  // And though `.validate()` will run `.load()` itself running `.load()` here will not have any
  // performance implications as `oas-normalizes` caches the result of `.load()` the first time you
  // run it.
  const { specType, definitionVersion } = await oas
    .load()
    .then(async schema => {
      const type = getAPIDefinitionType(schema);
      return {
        specType: capitalizeSpecType(type),
        definitionVersion: await oas.version(),
      };
    })
    .catch((err: Error) => {
      spinner.fail();
      this.debug(`raw oas load error object: ${JSON.stringify(err)}`);
      throw err;
    });

  let api: OpenAPI.Document;
  await oas.validate().catch((err: Error) => {
    spinner.fail();
    this.debug(`raw validation error object: ${JSON.stringify(err)}`);
    throw err;
  });

  // If we were supplied a Postman collection this will **always** convert it to OpenAPI 3.0.
  this.debug('converting the spec to OpenAPI 3.0 (if necessary)');
  api = await oas.convert().catch((err: Error) => {
    spinner.fail();
    this.debug(`raw openapi conversion error object: ${JSON.stringify(err)}`);
    throw err;
  });

  spinner.stop();

  this.debug('👇👇👇👇👇 spec validated! logging spec below 👇👇👇👇👇');
  this.debug(api);
  this.debug('👆👆👆👆👆 finished logging spec 👆👆👆👆👆');
  this.debug(`spec type: ${specType}`);

  if (this.flags.title) {
    this.debug(`renaming title field to ${this.flags.title}`);
    api.info.title = this.flags.title;
  }

  const specFileType = oas.type;

  // No need to optional chain here since `info.version` is required to pass validation
  const specVersion: string = api.info.version;
  this.debug(`version in spec: ${specVersion}`);

  const commandsThatBundle: (typeof command)[] = [
    'openapi inspect',
    'openapi reduce',
    'openapi resolve',
    'openapi upload',
  ];

  if (commandsThatBundle.includes(command)) {
    api = await oas.bundle();

    this.debug('spec bundled');
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
