import fs from 'fs';

import config from 'config';
import FormData from 'form-data';
import ora from 'ora';
import { file as tmpFile } from 'tmp-promise';

import fetch, { handleRes } from './fetch';
import { debug, oraOptions } from './logger';

/**
 * Uploads a spec to the API registry for usage in ReadMe
 *
 * @param {String} spec path to a bundled/validated spec file
 * @returns {String} a UUID in the API registry
 */
export default async function streamSpecToRegistry(spec: string) {
  const spinner = ora({ text: 'Staging your API definition for upload...', ...oraOptions() }).start();
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
      spinner.stop();
      return body.registryUUID;
    })
    .catch(e => {
      spinner.fail();
      throw e;
    });
}
