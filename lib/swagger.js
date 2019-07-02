const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const config = require('config');

exports.desc = 'Upload your swagger file to ReadMe';
exports.category = 'services';
exports.weight = 2;

const startPolling = (id, key) => {
  return new Promise((resolve, reject) => {
    const ping = () => {
      request.get(`${config.host}/api/v1/api-specification/${id}`, {
        auth: { user: key },
      }).then(data => {
        const result = JSON.parse(data);
        if (result.status !== 100) {
          return setTimeout(ping, 5000);
        }
        return resolve();
      }).catch(reject);
    }
    setTimeout(ping, 5000);
  });
}

exports.run = function({ args, opts }) {
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

  if (!args[0]) {
    return Promise.reject(
      new Error('No swagger file provided. Usage `rdme swagger <swagger-file>`'),
    );
  }

  function success(data) {
    console.log(data);
    console.log('Success! '.green);
  }

  function error(err) {
    return Promise.reject(new Error(`There was an error uploading: ${err}`));
  }

  const options = {
    formData: {
      swagger: fs.createReadStream(path.resolve(process.cwd(), args[0])),
    },
    auth: { user: key },
  };

  // Create
  if (!id) {
    return new Promise((resolve, reject) => {
      request.post(`${config.host}/api/v1/swagger`, options).then((data) => {
        const apiSetting = JSON.parse(data);
        const { _id } = apiSetting;
        return startPolling(_id, key);
      }, error)
      .then(resolve)
      .catch(reject);
    });
  }

  // Update
  return request.put(`${config.host}/api/v1/swagger/${id}`, options).then(success, error);
};
