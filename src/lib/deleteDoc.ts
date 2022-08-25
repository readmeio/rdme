import type { CommandCategories } from './baseCommand';

import config from 'config';
import { Headers } from 'node-fetch';

import fetch, { cleanHeaders, handleRes } from './fetch';

/**
 * Delete a document from ReadMe
 *
 * @param {String} key the project API key
 * @param {String} selectedVersion the project version
 * @param {Boolean} dryRun boolean indicating dry run mode
 * @param {String} slug The slug of the document to delete
 * @param {String} type module within ReadMe to update (e.g. docs, changelogs, etc.)
 * @returns {Promise<String>} a string containing the result
 */
export default async function deleteDoc(
  key: string,
  selectedVersion: string,
  dryRun: boolean,
  slug: string,
  type: CommandCategories
): Promise<string> {
  if (dryRun) {
    return Promise.resolve(`🎭 dry run! This will delete \`${slug}\`.`);
  }
  return fetch(`${config.get('host')}/api/v1/${type}/${slug}`, {
    method: 'delete',
    headers: cleanHeaders(
      key,
      new Headers({
        'x-readme-version': selectedVersion,
        'Content-Type': 'application/json',
      })
    ),
  })
    .then(handleRes)
    .then(() => `successfully deleted \`${slug}\`.`);
}
