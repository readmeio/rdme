const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const config = require('config');
const prompts = require('prompts');
const promptOpts = require('./prompts');

exports.desc = 'Upload your swagger file to ReadMe';
exports.category = 'services';
exports.weight = 2;
exports.run = async function({ args, opts }) {
  let { key, id } = opts;

  if (!key && opts.token) {
    console.warn(
      'Using `rdme` with --token has been deprecated. Please use --key and --id instead',
    );
    [key, id] = opts.token.split('-');
  }

  if (!key) {
    return Promise.reject(new Error('No api key provided. Please use --key'));
  }

  function callApi(specPath, versionAction, version) {
    async function versionPrompt(versionList) {
      const promptSelection = promptOpts.generatePrompts(versionList);
      const res = await prompts(promptSelection);

      if (res.option === 'create') {
        return callApi(specPath, res.option);
      }

      const versionId = res.versionSelection;
      return callApi(specPath, res.option, versionId);
    }

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
        const errorDesc = JSON.parse(err.error).description;
        if (typeof errorDesc === 'object') {
          return Promise.resolve(versionPrompt(errorDesc));
        }
        return Promise.reject(new Error(errorDesc));
      } catch (e) {
        return Promise.reject(new Error('There was an error uploading!'));
      }
    }

    const options = {
      formData: {
        spec: fs.createReadStream(path.resolve(process.cwd(), specPath)),
      },
      auth: { user: key },
      resolveWithFullResponse: true,
      headers: {
        versionAction,
        version,
      },
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

  if (args[0]) {
    return callApi(args[0]);
  }

  // If the user didn't supply a specification, let's try to locate what they've got, and upload
  // that. If they don't have any, let's let the user know how they can get one going.
  return new Promise((resolve, reject) => {
    ['swagger.json', 'swagger.yaml', 'openapi.json', 'openapi.yaml'].forEach(function(file) {
      if (!fs.existsSync(file)) {
        return;
      }

      console.log(`We found ${file} and are attempting to upload it.`.yellow);

      resolve(callApi(file));
    });

    reject(
      new Error(
        "We couldn't find a Swagger or OpenAPI file.\n\n" +
          'Run `rdme swagger ./path/to/file` to upload an existing file or `rdme oas init` to create a fresh one!',
      ),
    );
  });
};
