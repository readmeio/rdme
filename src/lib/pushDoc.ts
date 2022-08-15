import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import config from 'config';
import grayMatter from 'gray-matter';
import { Headers } from 'node-fetch';

import APIError from './apiError';
import { CommandCategories } from './baseCommand';
import fetch, { cleanHeaders, handleRes } from './fetch';
import { debug } from './logger';

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
  debug(`reading file ${filepath}`);
  const file = fs.readFileSync(filepath, 'utf8');
  const matter = grayMatter(file);
  debug(`frontmatter for ${filepath}: ${JSON.stringify(matter)}`);

  // Stripping the subdirectories and markdown extension from the filename and lowercasing to get the default slug.
  const slug = matter.data.slug || path.basename(filepath).replace(path.extname(filepath), '').toLowerCase();
  const hash = crypto.createHash('sha1').update(file).digest('hex');

  let data: {
    body?: string;
    html?: string;
    htmlmode?: boolean;
    lastUpdatedHash: string;
  } = { body: matter.content, ...matter.data, lastUpdatedHash: hash };

  if (type === CommandCategories.CUSTOM_PAGES) {
    if (filepath.endsWith('.html')) {
      data = { html: matter.content, htmlmode: true, ...matter.data, lastUpdatedHash: hash };
    } else {
      data = { body: matter.content, htmlmode: false, ...matter.data, lastUpdatedHash: hash };
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
        ...data,
      }),
    })
      .then(res => handleRes(res))
      .then(res => `🌱 successfully created '${res.slug}' with contents from ${filepath}`);
  }

  function updateDoc(existingDoc: typeof data) {
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
          ...data,
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

/**
 * Recursively grabs all files within a given directory
 * (including subdirectories)
 * @param {String} folderToSearch path to directory
 * @param pathFilter a function that takes in a directory/file path
 * and returns a boolean. used for optimizing recursion paths
 * e.g. paths specified in a file like `.gitignore`
 * @link https://github.com/kaelzhang/node-ignore#createfilter
 * @returns {String[]} array of files
 */
export function readdirRecursive(
  folderToSearch: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pathFilter = (_: string) => true
): string[] {
  const filesInFolder = fs.readdirSync(folderToSearch, { withFileTypes: true }).filter(item => {
    // Some logic to construct pathname the way that `ignore` package consumes it
    // https://github.com/kaelzhang/node-ignore#2-filenames-and-dirnames
    let fullPathName = path.join(folderToSearch, item.name);
    if (item.isDirectory()) fullPathName = `${fullPathName}/`;

    return pathFilter(fullPathName);
  });
  const files = filesInFolder
    .filter(fileHandle => fileHandle.isFile())
    .map(fileHandle => path.join(folderToSearch, fileHandle.name));
  const folders = filesInFolder.filter(fileHandle => fileHandle.isDirectory());
  const subFiles = [].concat(
    ...folders.map(fileHandle => readdirRecursive(path.join(folderToSearch, fileHandle.name), pathFilter))
  );
  return [...files, ...subFiles];
}
