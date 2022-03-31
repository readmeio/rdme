const chalk = require('chalk');
const fs = require('fs');
const { debug } = require('../lib/logger');
const prepareOas = require('../lib/prepareOas');

module.exports = class ValidateCommand {
  constructor() {
    this.command = 'validate';
    this.usage = 'validate [file] [options]';
    this.description = 'Validate your OpenAPI/Swagger definition.';
    this.category = 'apis';
    this.position = 2;

    this.hiddenArgs = ['spec'];
    this.args = [
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
  }

  async run(opts) {
    const { spec, workingDirectory } = opts;

    if (workingDirectory) {
      process.chdir(workingDirectory);
    }

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    async function validateSpec(specPath) {
      const { specType } = await prepareOas(specPath);
      return Promise.resolve(chalk.green(`${specPath} is a valid ${specType} API definition!`));
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
          "We couldn't find an OpenAPI or Swagger definition.\n\nPlease specify the path to your definition with `rdme validate ./path/to/api/definition`."
        )
      );
    });
  }
};
