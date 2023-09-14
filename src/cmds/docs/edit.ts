import type { AuthenticatedCommandOptions } from '../../lib/baseCommand.js';

import fs from 'node:fs';
import { promisify } from 'node:util';

import { Headers } from 'node-fetch';

import editor from 'editor';

import APIError from '../../lib/apiError.js';
import Command, { CommandCategories } from '../../lib/baseCommand.js';
import config from '../../lib/config.js';
import isHidden from '../../lib/decorators/isHidden.js';
import readmeAPIFetch, { cleanHeaders, handleRes } from '../../lib/readmeAPIFetch.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

interface Options {
  mockEditor?: (filename: string, cb: () => void) => void;
  slug?: string;
}

@isHidden
export default class DocsEditCommand extends Command {
  constructor() {
    super();

    this.command = 'docs:edit';
    this.usage = 'docs:edit <slug> [options]';
    this.description = 'Edit a single file from your ReadMe project without saving locally. [deprecated]';
    this.cmdCategory = CommandCategories.DOCS;

    this.hiddenArgs = ['slug'];
    this.args = [
      this.getKeyArg(),
      this.getVersionArg(),
      {
        name: 'slug',
        type: String,
        defaultOption: true,
      },
    ];
  }

  async run(opts: AuthenticatedCommandOptions<Options>): Promise<string> {
    Command.warn('`rdme docs:edit` is now deprecated and will be removed in a future release.');
    await super.run(opts);

    const { slug, key, version } = opts;

    if (!slug) {
      return Promise.reject(new Error(`No slug provided. Usage \`${config.cli} ${this.usage}\`.`));
    }

    const selectedVersion = await getProjectVersion(version, key);

    Command.debug(`selectedVersion: ${selectedVersion}`);

    const filename = `${slug}.md`;

    const existingDoc = await readmeAPIFetch(`/api/v1/docs/${slug}`, {
      method: 'get',
      headers: cleanHeaders(key, selectedVersion, new Headers({ Accept: 'application/json' })),
    }).then(handleRes);

    await writeFile(filename, existingDoc.body);

    Command.debug(`wrote to local file: ${filename}, opening editor`);

    return new Promise((resolve, reject) => {
      (opts.mockEditor || editor)(filename, async (code: number) => {
        Command.debug(`editor closed with code ${code}`);
        if (code !== 0) return reject(new Error('Non zero exit code from $EDITOR'));
        const updatedDoc = await readFile(filename, 'utf8');

        Command.debug(`read edited contents of ${filename}, sending to ReadMe`);

        return readmeAPIFetch(`/api/v1/docs/${slug}`, {
          method: 'put',
          headers: cleanHeaders(key, selectedVersion, new Headers({ 'Content-Type': 'application/json' })),
          body: JSON.stringify(
            Object.assign(existingDoc, {
              body: updatedDoc,
            }),
          ),
        })
          .then(res => handleRes(res, false))
          .then(async res => {
            // We need to use the `reject` function from
            // the Promise that's wrapping this function.
            if (res.error) {
              return reject(new APIError(res));
            }

            Command.info('Doc successfully updated. Cleaning up local file.');

            await unlink(filename);
            Command.debug('file unlinked');

            // Normally we should resolve with a value that is logged to the console,
            // but since we need to wait for the temporary file to be removed,
            // it's okay to resolve the promise with no value.
            return resolve('');
          });
      });
    });
  }
}
