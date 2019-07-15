const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const config = require('config');
const { prompt } = require('enquirer');
const promptOpts = require('./prompts');

exports.desc = 'Upload your swagger file to ReadMe';
exports.category = 'services';
exports.weight = 2;

exports.run = async function({ args, opts }) {
  const { version } = opts;
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
        version: versionCleaned,
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

  async function getSwaggerVersion(specPath, versionFlag) {
    let versionSpec;
    let versionCleaned;

    if (!versionFlag) {
      const file = fs.readFileSync(path.resolve(process.cwd(), specPath), 'utf8');
      versionSpec = JSON.parse(file).info.version;
    }

    const options = { json: { version: versionSpec || versionFlag }, auth: { user: key } };

    try {
      versionCleaned = await request.get(
        `${config.host}/api/v1/version/${versionSpec || versionFlag}`,
        options,
      );
    } catch (e) {
      if (e.statusCode === 400) {
        const versionList = await request.get(`${config.host}/api/v1/version`, options);
        options.json.from = versionList[0].version;

        const promptResponse = await prompt(promptOpts.generatePrompts(versionList));
        const { option, versionSelection } = promptResponse;

        if (option === 'update') return versionSelection;

        versionCleaned = await request.post(`${config.host}/api/v1/version`, options);
      } else {
        throw new Error('Error occurred while retrieving swagger version.');
      }
    }
    return versionCleaned.version;
  }

  if (args[0]) {
    const selectedVersion = await getSwaggerVersion(args[0], version);
    return callApi(args[0], selectedVersion);
  }

  // If the user didn't supply a specification, let's try to locate what they've got, and upload
  // that. If they don't have any, let's let the user know how they can get one going.
  return new Promise(async (resolve, reject) => {
    let foundFile;
    ['swagger.json', 'swagger.yaml', 'openapi.json', 'openapi.yaml'].forEach(file => {
      if (!fs.existsSync(file)) {
        return;
      }

      console.log(`We found ${file} and are attempting to upload it.`.yellow);
      foundFile = file;
    });

    if (foundFile) {
      const selectedVersion = await getSwaggerVersion(foundFile, version);
      resolve(callApi(foundFile, selectedVersion));
    }

    reject(
      new Error(
        "We couldn't find a Swagger or OpenAPI file.\n\n" +
          'Run `rdme swagger ./path/to/file` to upload an existing file or `rdme oas init` to create a fresh one!',
      ),
    );
  });
};
