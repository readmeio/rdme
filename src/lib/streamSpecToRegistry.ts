import fs from 'node:fs';

import ora from 'ora';
import { file as tmpFile } from 'tmp-promise';

import { debug, oraOptions } from './logger.js';
import { handleAPIv1Res, readmeAPIv1Fetch } from './readmeAPIFetch.js';

/**
 * Uploads a spec to the API registry for usage in ReadMe
 *
 * @returns a UUID in the API registry
 */
export default async function streamSpecToRegistry(
  /**
   * path to a bundled/validated spec file
   */
  spec: string,
): Promise<string> {
  const spinner = ora({ text: 'Staging your API definition for upload...', ...oraOptions() }).start();
  // Create a temporary file to write the bundled spec to,
  // which we will then stream into the form data body
  const { path } = await tmpFile({ prefix: 'rdme-openapi-', postfix: '.json' });
  debug(`creating temporary file at ${path}`);
  await fs.writeFileSync(path, spec);
  const stream = fs.createReadStream(path);

  debug('file and stream created, streaming into form data payload');
  const formData = new FormData();
  formData.append('spec', {
    type: 'application/json',
    name: 'openapi.json',
    [Symbol.toStringTag]: 'File',
    stream() {
      return stream;
    },
  });

  const options = {
    body: formData,
    headers: {
      Accept: 'application/json',
    },
    method: 'POST',
  };

  return readmeAPIv1Fetch('/api/v1/api-registry', options)
    .then(handleAPIv1Res)
    .then(body => {
      spinner.stop();
      return body.registryUUID;
    })
    .catch(e => {
      spinner.fail();
      throw e;
    });
}
