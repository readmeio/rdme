import type { CommandOptions } from '../../lib/baseCommand';

import fs from 'fs';
import { promisify } from 'util';

import config from 'config';
import { Headers } from 'node-fetch';

import editor from 'editor';

import APIError from '../../lib/apiError';
import Command, { CommandCategories } from '../../lib/baseCommand';
import fetch, { cleanHeaders, handleRes } from '../../lib/fetch';
import { debug, info } from '../../lib/logger';
import { getProjectVersion } from '../../lib/versionSelect';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

export type Options = {
  mockEditor?: (filename: string, cb: () => void) => void;
  slug?: string;
};

export default class EditDocsCommand extends Command {
  constructor() {
    super();

    this.command = 'docs:edit';
    this.usage = 'docs:edit <slug> [options]';
    this.description = 'Edit a single file from your ReadMe project without saving locally.';
    this.cmdCategory = CommandCategories.DOCS;
    this.position = 2;

    this.hiddenArgs = ['slug'];
    this.args = [
      {
        name: 'key',
        type: String,
        description: 'Project API key',
      },
      this.getVersionArg(),
      {
        name: 'slug',
        type: String,
        defaultOption: true,
      },
    ];
  }

  async run(opts: CommandOptions<Options>): Promise<undefined> {
    super.run(opts, true);

    const { slug, key, version } = opts;

    if (!slug) {
      return Promise.reject(new Error(`No slug provided. Usage \`${config.get('cli')} ${this.usage}\`.`));
    }

    const selectedVersion = await getProjectVersion(version, key, true);

    debug(`selectedVersion: ${selectedVersion}`);

    const filename = `${slug}.md`;

    const existingDoc = await fetch(`${config.get('host')}/api/v1/docs/${slug}`, {
      method: 'get',
      headers: cleanHeaders(
        key,
        new Headers({
          'x-readme-version': selectedVersion,
          Accept: 'application/json',
        })
      ),
    }).then(res => handleRes(res));

    await writeFile(filename, existingDoc.body);

    debug(`wrote to local file: ${filename}, opening editor`);

    return new Promise((resolve, reject) => {
      (opts.mockEditor || editor)(filename, async (code: number) => {
        debug(`editor closed with code ${code}`);
        if (code !== 0) return reject(new Error('Non zero exit code from $EDITOR'));
        const updatedDoc = await readFile(filename, 'utf8');

        debug(`read edited contents of ${filename}, sending to ReadMe`);

        return fetch(`${config.get('host')}/api/v1/docs/${slug}`, {
          method: 'put',
          headers: cleanHeaders(
            key,
            new Headers({
              'x-readme-version': selectedVersion,
              'Content-Type': 'application/json',
            })
          ),
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
            info('Doc successfully updated. Cleaning up local file.');
            await unlink(filename);
            debug('file unlinked');
            // Normally we should resolve with a value that is logged to the console,
            // but since we need to wait for the temporary file to be removed,
            // it's okay to resolve the promise with no value.
            return resolve(undefined);
          });
      });
    });
  }
}
