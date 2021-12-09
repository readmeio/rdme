const chalk = require('chalk');
const fs = require('fs');
const OASNormalize = require('oas-normalize');

exports.command = 'validate';
exports.usage = 'validate [file] [options]';
exports.description = 'Validate your OpenAPI/Swagger definition.';
exports.category = 'apis';
exports.position = 2;

exports.hiddenArgs = ['spec'];
exports.args = [
  {
    name: 'spec',
    type: String,
    defaultOption: true,
  },
];

exports.run = async function (opts) {
  const { spec } = opts;

  async function validateSpec(specPath) {
    const oas = new OASNormalize(specPath, { colorizeErrors: true, enablePaths: true });

    return oas
      .validate(false)
      .then(api => {
        if (api.swagger) {
          console.log(chalk.green(`${specPath} is a valid Swagger API definition!`));
        } else {
          console.log(chalk.green(`${specPath} is a valid OpenAPI API definition!`));
        }
      })
      .catch(err => {
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
      if (!fs.existsSync(file)) {
        return;
      }

      console.log(chalk.yellow(`We found ${file} and are attempting to validate it.`));
      resolve(validateSpec(file));
    });

    reject(
      new Error(
        "We couldn't find an OpenAPI or Swagger definition.\n\nIf you need help creating one run `rdme oas init`!"
      )
    );
  });
};
