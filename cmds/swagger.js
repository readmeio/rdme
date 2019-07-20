const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const config = require('config');
const { prompt } = require('enquirer');
const promptOpts = require('../lib/prompts');

exports.command = 'swagger';
exports.usage = 'swagger [spec]';
exports.description = 'Upload, or sync, your Swagger/OpenAPI file to ReadMe.';
exports.category = 'apis';
exports.weight = 2;

exports.hiddenArgs = ['token', 'spec'];
exports.args = [
  {
    name: 'key',
    type: String,
    description: 'Project API key'
  },
  {
    name: 'id',
    type: String,
    description: `Unique identifier for your specification. Use this if you're resyncing an existing specification`
  },
  {
    name: 'token',
    type: String,
    description: 'Project token. Deprecated, please use `--key` instead',
  },
  {
    name: 'version',
    type: String,
    description: 'Project version'
  },
  {
    name: 'spec',
    type: String,
    defaultOption: true
  },
];

exports.run = async function (opts) {
  const {spec, version} = opts;
  let {key, id} = opts;
  let selectedVersion;

  if (!key && opts.token) {
    console.warn(
      'Using `rdme` with --token has been deprecated. Please use --key and --id instead',
    );
    [key, id] = opts.token.split('-');
  }

  if (!key) {
    return Promise.reject(new Error('No api key provided. Please use --key'));
  }

  function callApi(specPath, versionCleaned) {
    function success(data) {
      const message = !id
        ? "You've successfully uploaded a new swagger file to your ReadMe project!"
        : "You've successfully updated a swagger file on your ReadMe project!";
      console.log(`
  ${message}

    ${`${data.headers.location}`.green}`);

      console.log(`
  To update your swagger file, run the following:

    ${
      `rdme swagger FILE --key=${key} --id=${
        // eslint-disable-next-line
        JSON.parse(data.body)._id
      }`.green
    }
  `);
    }

    function error(err) {
      try {
        return Promise.reject(new Error(JSON.parse(err.error).description));
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
      },
      auth: { user: key },
      resolveWithFullResponse: true,
    };

    // Create
    if (!id) {
      return request.post(`${config.host}/api/v1/api-specification`, options).then(success, error);
    }

    // Update
    return request
      .put(`${config.host}/api/v1/api-specification/${id}`, options)
      .then(success, error);
  }

  async function getSwaggerVersion(versionFlag) {
    const options = { json: {}, auth: { user: key } };

    try {
      if (versionFlag) {
        options.json.version = versionFlag;
        const foundVersion = await request.get(
          `${config.host}/api/v1/version/${versionFlag}`,
          options,
        );

        return foundVersion.version;
      }

      const versionList = await request.get(`${config.host}/api/v1/version`, options);
      const { option, versionSelection, newVersion } = await prompt(
        promptOpts.generatePrompts(versionList, versionFlag),
      );

      if (option === 'update') return versionSelection;

      options.json = { from: versionList[0].version, version: newVersion, is_stable: false };
      await request.post(`${config.host}/api/v1/version`, options);

      return newVersion;
    } catch (e) {
      return Promise.reject(e.error);
    }
  }

  if (!id) {
    selectedVersion = await getSwaggerVersion(version).catch((e) => {
      return Promise.reject(e);
    });
  }

  if (spec) {
    return callApi(spec, selectedVersion);
  }

  // If the user didn't supply a specification, let's try to locate what they've got, and upload
  // that. If they don't have any, let's let the user know how they can get one going.
  return new Promise(async (resolve, reject) => {
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
          'Run `rdme swagger ./path/to/file` to upload an existing file or `rdme oas init` to create a fresh one!',
      ),
    );
  });
};
