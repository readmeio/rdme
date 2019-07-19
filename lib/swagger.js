const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const config = require('config');

exports.desc = 'Upload your swagger file to ReadMe';
exports.category = 'services';
exports.weight = 2;

/**
 * I want ReadMe to give me a status update on my file
 * @param  {String} id  the id of the api-specification
 * @param  {String} key the auth key
 * @return {Promise}     The result when it is done
 */
const startPolling = async (id, key) =>
  new Promise((resolve, reject) => {
    const ping = () => {
      request
        .get(`${config.host}/api/v1/api-specification/${id}`, {
          auth: { user: key },
        })
        .then(data => {
          const result = JSON.parse(data);
          if (result.status !== 100) {
            return setTimeout(ping, 5000);
          }
          return resolve();
        })
        .catch(reject);
    };
    setTimeout(ping, 1000);
  });

/**
 * I want ReadMe to get the logs for the upload
 * @param  {String} id  the id of the api-specification
 * @param  {String} key the auth key for the ReadMe project
 * @return {Promise<Array>}     The promise resolved with the array of logs
 */
const getLogs = function(id, key) {
  return request.get(`${config.host}/api/v1/api-specification/logs/${id}`, {
    auth: { user: key },
  });
};

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

  if (!args[0]) {
    return Promise.reject(
      new Error('No swagger file provided. Usage `rdme swagger <swagger-file>`'),
    );
  }

  const options = {
    formData: {
      swagger: fs.createReadStream(path.resolve(process.cwd(), args[0])),
    },
    auth: { user: key },
  };

  try {
    if (!id) {
      const data = await request.post(`${config.host}/api/v1/swagger`, options);
      const { _id } = JSON.parse(data);
      id = _id;
    } else {
      await request.put(`${config.host}/api/v1/swagger/${id}`, options);
    }
  } catch (e) {
    return Promise.reject(new Error(`There was an error uploading!`));
  }


  try {
    await startPolling(id, key);
  } catch (e) {
    const logs = await getLogs(id, key);
    return Promise.reject(new Error(`There was an error uploading: ${logs}`));
  }


  return Promise.resolve('Success!'.green);
};
