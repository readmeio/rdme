const { handleRes } = require('./fetch');
const config = require('config');
const { debug } = require('./logger');
const fetch = require('./fetch');
const FormData = require('form-data');
const fs = require('fs');
const ora = require('ora');
const { file: tmpFile } = require('tmp-promise');

const testing = process.env.NODE_ENV === 'testing';

const text = 'Uploading API Definition to ReadMe...';

/**
 * Uploads a spec to the API registry for usage in ReadMe
 *
 * @param {String} spec path to a bundled/validated spec file
 * @returns {String} a UUID in the API registry
 */
module.exports = async function streamSpecToRegistry(spec) {
  const spinner = ora({ isSilent: testing, text }).start();
  // Create a temporary file to write the bundled spec to,
  // which we will then stream into the form data body
  const { path } = await tmpFile({ prefix: 'rdme-openapi-', postfix: '.json' });
  debug(`creating temporary file at ${path}`);
  await fs.writeFileSync(path, spec);
  const stream = fs.createReadStream(path);

  debug('file and stream created, streaming into form data payload');
  const formData = new FormData();
  formData.append('spec', stream);

  const options = {
    body: formData,
    headers: {
      Accept: 'application/json',
    },
    method: 'POST',
  };

  return fetch(`${config.get('host')}/api/v1/api-registry`, options)
    .then(res => handleRes(res))
    .then(body => {
      spinner.stopAndPersist({ symbol: '🚀', text: `${text} done!` });
      return body.registryUUID;
    })
    .catch(e => {
      spinner.fail();
      throw e;
    });
};
