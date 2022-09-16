import chalk from 'chalk';
import config from 'config';
import { Headers } from 'node-fetch';

import APIError from './apiError';
import { CommandCategories } from './baseCommand';
import fetch, { cleanHeaders, handleRes } from './fetch';
import { debug } from './logger';
import readDoc from './readDoc';

/**
 * Reads the contents of the specified Markdown or HTML file
 * and creates/updates the corresponding doc in ReadMe
 *
 * @param {String} key the project API key
 * @param {String} selectedVersion the project version
 * @param {Boolean} dryRun boolean indicating dry run mode
 * @param {String} filepath path to the HTML/Markdown file
 *  (file extension must end in `.html`, `.md`., or `.markdown`)
 * @param {String} type module within ReadMe to update (e.g. docs, changelogs, etc.)
 * @returns {Promise<String>} a string containing the result
 */
export default async function pushDoc(
  key: string,
  selectedVersion: string,
  dryRun: boolean,
  filepath: string,
  type: CommandCategories
) {
  const { hash, matter, slug } = readDoc(filepath);

  let payload: {
    body?: string;
    html?: string;
    htmlmode?: boolean;
    lastUpdatedHash: string;
  } = { body: matter.content, ...matter.data, lastUpdatedHash: hash };

  if (type === CommandCategories.CUSTOM_PAGES) {
    if (filepath.endsWith('.html')) {
      payload = { html: matter.content, htmlmode: true, ...matter.data, lastUpdatedHash: hash };
    } else {
      payload = { body: matter.content, htmlmode: false, ...matter.data, lastUpdatedHash: hash };
    }
  }

  function createDoc() {
    if (dryRun) {
      return `🎭 dry run! This will create '${slug}' with contents from ${filepath} with the following metadata: ${JSON.stringify(
        matter.data
      )}`;
    }

    return fetch(`${config.get('host')}/api/v1/${type}`, {
      method: 'post',
      headers: cleanHeaders(
        key,
        new Headers({
          'x-readme-version': selectedVersion,
          'Content-Type': 'application/json',
        })
      ),
      body: JSON.stringify({
        slug,
        ...payload,
      }),
    })
      .then(res => handleRes(res))
      .then(res => `🌱 successfully created '${res.slug}' (ID: ${res.id}) with contents from ${filepath}`);
  }

  function updateDoc(existingDoc: typeof payload) {
    if (hash === existingDoc.lastUpdatedHash) {
      return `${dryRun ? '🎭 dry run! ' : ''}\`${slug}\` ${
        dryRun ? 'will not be' : 'was not'
      } updated because there were no changes.`;
    }

    if (dryRun) {
      return `🎭 dry run! This will update '${slug}' with contents from ${filepath} with the following metadata: ${JSON.stringify(
        matter.data
      )}`;
    }

    return fetch(`${config.get('host')}/api/v1/${type}/${slug}`, {
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
          ...payload,
        })
      ),
    })
      .then(res => handleRes(res))
      .then(res => `✏️ successfully updated '${res.slug}' with contents from ${filepath}`);
  }

  return fetch(`${config.get('host')}/api/v1/${type}/${slug}`, {
    method: 'get',
    headers: cleanHeaders(
      key,
      new Headers({
        'x-readme-version': selectedVersion,
        Accept: 'application/json',
      })
    ),
  })
    .then(async res => {
      const body = await res.json();
      debug(`GET /${type}/:slug API response for ${slug}: ${JSON.stringify(body)}`);
      if (!res.ok) {
        if (res.status !== 404) return Promise.reject(new APIError(body));
        debug(`error retrieving data for ${slug}, creating doc`);
        return createDoc();
      }
      debug(`data received for ${slug}, updating doc`);
      return updateDoc(body);
    })
    .catch(err => {
      // eslint-disable-next-line no-param-reassign
      err.message = `Error uploading ${chalk.underline(filepath)}:\n\n${err.message}`;
      throw err;
    });
}
