import chalk from 'chalk';
import fs from 'fs';
import OASNormalize from 'oas-normalize';
import { debug } from '../lib/logger';

type Args = {
  spec: string;
  workingDirectory?: string;
};

export default class ValidateCommand implements Command {
  command = 'validate';
  usage = 'validate [file] [options]';
  description = 'Validate your OpenAPI/Swagger definition.';
  category = 'apis';
  position = 2;

  hiddenArgs = ['spec'];
  args = [
    {
      name: 'spec',
      type: String,
      defaultOption: true,
    },
    {
      name: 'workingDirectory',
      type: String,
      description: 'Working directory (for usage with relative external references)',
    },
  ];

  async run(opts: Args) {
    const { spec, workingDirectory } = opts;

    if (workingDirectory) {
      process.chdir(workingDirectory);
    }

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    async function validateSpec(specPath: string) {
      const oas = new OASNormalize(specPath, { colorizeErrors: true, enablePaths: true });

      return oas
        .validate(false)
        .then((api: Record<string, unknown>) => {
          if (api.swagger) {
            return Promise.resolve(chalk.green(`${specPath} is a valid Swagger API definition!`));
          }
          return Promise.resolve(chalk.green(`${specPath} is a valid OpenAPI API definition!`));
        })
        .catch((err: Error) => {
          debug(`raw validation error object: ${JSON.stringify(err)}`);
          return Promise.reject(new Error(err.message));
        });
    }

    if (spec) {
      return validateSpec(spec);
    }

    // If the user didn't supply an API specification, let's try to locate what they've got, and validate that. If they
    // don't have any, let's let the user know how they can get one going.
    return new Promise((resolve, reject) => {
      ['swagger.json', 'swagger.yaml', 'openapi.json', 'openapi.yaml'].forEach(file => {
        debug(`looking for definition with filename: ${file}`);
        if (!fs.existsSync(file)) {
          debug(`${file} not found`);
          return;
        }

        console.info(chalk.yellow(`We found ${file} and are attempting to validate it.`));
        resolve(validateSpec(file));
      });

      reject(
        new Error(
          "We couldn't find an OpenAPI or Swagger definition.\n\nIf you need help creating one run `rdme oas init`!"
        )
      );
    });
  }
}
