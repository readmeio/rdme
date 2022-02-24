const config = require('config');
const fs = require('fs');
const editor = require('editor');
const { promisify } = require('util');
const APIError = require('../../lib/apiError');
const { getProjectVersion } = require('../../lib/versionSelect');
const fetch = require('../../lib/fetch');
const { cleanHeaders, handleRes } = require('../../lib/fetch');
const { debug } = require('../../lib/logger');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

module.exports = class EditDocsCommand {
  constructor() {
    this.command = 'docs:edit';
    this.usage = 'docs:edit <slug> [options]';
    this.description = 'Edit a single file from your ReadMe project without saving locally.';
    this.category = 'docs';
    this.position = 2;

    this.hiddenArgs = ['slug'];
    this.args = [
      {
        name: 'key',
        type: String,
        description: 'Project API key',
      },
      {
        name: 'version',
        type: String,
        description: 'Project version',
      },
      {
        name: 'slug',
        type: String,
        defaultOption: true,
      },
    ];
  }

  async run(opts) {
    const { slug, key, version } = opts;

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    if (!slug) {
      return Promise.reject(new Error(`No slug provided. Usage \`${config.get('cli')} ${this.usage}\`.`));
    }

    const selectedVersion = await getProjectVersion(version, key, true).catch(e => {
      return Promise.reject(e);
    });

    debug(`selectedVersion: ${selectedVersion}`);

    const filename = `${slug}.md`;

    const existingDoc = await fetch(`${config.get('host')}/api/v1/docs/${slug}`, {
      method: 'get',
      headers: cleanHeaders(key, {
        'x-readme-version': selectedVersion,
        Accept: 'application/json',
      }),
    }).then(res => handleRes(res));

    await writeFile(filename, existingDoc.body);

    debug(`wrote to local file: ${filename}, opening editor`);

    return new Promise((resolve, reject) => {
      (opts.mockEditor || editor)(filename, async code => {
        debug(`editor closed with code ${code}`);
        if (code !== 0) return reject(new Error('Non zero exit code from $EDITOR'));
        const updatedDoc = await readFile(filename, 'utf8');

        debug(`read edited contents of ${filename}, sending to ReadMe`);

        return fetch(`${config.get('host')}/api/v1/docs/${slug}`, {
          method: 'put',
          headers: cleanHeaders(key, {
            'x-readme-version': selectedVersion,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(
            Object.assign(existingDoc, {
              body: updatedDoc,
            })
          ),
        })
          .then(res => res.json())
          .then(async res => {
            debug(`response from PUT request: ${res}`);
            // The reason we aren't using our handleRes() function here is
            // because we need to use the `reject` function from
            // the Promise that's wrapping this function.
            if (res.error) {
              return reject(new APIError(res));
            }
            console.info(`Doc successfully updated. Cleaning up local file.`);
            await unlink(filename);
            debug('file unlinked');
            // Normally we should resolve with a value that is logged to the console,
            // but since we need to wait for the temporary file to be removed,
            // it's okay to resolve the promise with no value.
            return resolve();
          });
      });
    });
  }
};
