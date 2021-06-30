require('colors');
const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const config = require('config');
const { prompt } = require('enquirer');
const OASNormalize = require('oas-normalize');
const promptOpts = require('../lib/prompts');
const APIError = require('../lib/apiError');

exports.command = 'openapi';
exports.usage = 'openapi [file] [options]';
exports.description = 'Upload, or sync, your Swagger/OpenAPI file to ReadMe.';
exports.category = 'apis';
exports.position = 1;

exports.hiddenArgs = ['token', 'spec'];
exports.args = [
  {
    name: 'key',
    type: String,
    description: 'Project API key',
  },
  {
    name: 'id',
    type: String,
    description: `Unique identifier for your specification. Use this if you're resyncing an existing specification`,
  },
  {
    name: 'token',
    type: String,
    description: 'Project token. Deprecated, please use `--key` instead',
  },
  {
    name: 'version',
    type: String,
    description: 'Project version',
  },
  {
    name: 'spec',
    type: String,
    defaultOption: true,
  },
];

exports.run = async function (opts) {
  const { spec, version } = opts;
  let { key, id } = opts;
  let selectedVersion;
  let isUpdate;

  if (!key && opts.token) {
    console.warn('Using `rdme` with --token has been deprecated. Please use `--key` and `--id` instead.');

    [key, id] = opts.token.split('-');
  }

  if (!key) {
    return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
  }

  async function callApi(specPath, versionCleaned) {
    // @todo Tailor messaging to what is actually being handled here. If the user is uploading an OpenAPI file, never mention that they uploaded/updated a Swagger file.

    function success(data) {
      const message = !isUpdate
        ? "You've successfully uploaded a new Swagger file to your ReadMe project!"
        : "You've successfully updated a Swagger file on your ReadMe project!";

      console.log(
        [
          message,
          '',
          `\t${`${data.headers.location}`.green}`,
          '',
          'To update your Swagger or OpenAPI file, run the following:',
          '',
          // eslint-disable-next-line no-underscore-dangle
          `\trdme openapi FILE --key=${key} --id=${JSON.parse(data.body)._id}`.green,
        ].join('\n')
      );
    }

    function error(err) {
      try {
        const parsedError = JSON.parse(err.error);
        return Promise.reject(new APIError(parsedError));
      } catch (e) {
        return Promise.reject(new Error('There was an error uploading!'));
      }
    }

    const options = {
      formData: {
        spec: fs.createReadStream(path.resolve(process.cwd(), specPath)),
      },
      headers: {
        'x-readme-version': versionCleaned,
        'x-readme-source': 'cli',
      },
      auth: { user: key },
      resolveWithFullResponse: true,
    };

    function createSpec() {
      return request.post(`${config.host}/api/v1/api-specification`, options).then(success, error);
    }

    function updateSpec(specId) {
      isUpdate = true;

      return request.put(`${config.host}/api/v1/api-specification/${specId}`, options).then(success, error);
    }

    if (spec) {
      const oas = new OASNormalize(spec, { enablePaths: true });
      await oas.validate().catch(err => {
        return Promise.reject(err);
      });
    }

    /*
      Create a new OAS file in Readme:
        - Enter flow if user does not pass an id as cli arg
        - Check to see if any existing files exist with a specific version
        - If none exist, default to creating a new instance of a spec
        - If found, prompt user to either create a new spec or update an existing one
    */

    if (!id) {
      const apiSettings = await request.get(`${config.host}/api/v1/api-specification`, {
        headers: {
          'x-readme-version': versionCleaned,
        },
        json: true,
        auth: { user: key },
      });

      if (!apiSettings.length) return createSpec();

      const { option, specId } = await prompt(promptOpts.createOasPrompt(apiSettings));
      return option === 'create' ? createSpec() : updateSpec(specId);
    }

    /*
      Update an existing OAS file in Readme:
        - Enter flow if user passes an id as cli arg
    */
    return updateSpec(id);
  }

  async function getSwaggerVersion(versionFlag) {
    const options = { json: {}, auth: { user: key } };

    try {
      if (versionFlag) {
        options.json.version = versionFlag;
        const foundVersion = await request.get(`${config.host}/api/v1/version/${versionFlag}`, options);

        return foundVersion.version;
      }

      const versionList = await request.get(`${config.host}/api/v1/version`, options);
      const { option, versionSelection, newVersion } = await prompt(
        promptOpts.generatePrompts(versionList, versionFlag)
      );

      if (option === 'update') return versionSelection;

      options.json = { from: versionList[0].version, version: newVersion, is_stable: false };
      await request.post(`${config.host}/api/v1/version`, options);

      return newVersion;
    } catch (err) {
      return Promise.reject(new APIError(err));
    }
  }

  if (!id) {
    selectedVersion = await getSwaggerVersion(version).catch(e => {
      return Promise.reject(e);
    });
  }

  if (spec) {
    return callApi(spec, selectedVersion);
  }

  // If the user didn't supply a specification, let's try to locate what they've got, and upload
  // that. If they don't have any, let's let the user know how they can get one going.
  return new Promise((resolve, reject) => {
    ['swagger.json', 'swagger.yaml', 'openapi.json', 'openapi.yaml'].forEach(file => {
      if (!fs.existsSync(file)) {
        return;
      }

      console.log(`We found ${file} and are attempting to upload it.`.yellow);
      resolve(callApi(file, selectedVersion));
    });

    reject(
      new Error(
        "We couldn't find a Swagger or OpenAPI file.\n\n" +
          'Run `rdme openapi ./path/to/file` to upload an existing file or `rdme oas init` to create a fresh one!'
      )
    );
  });
};
