import fs from 'fs/promises';
import path from 'path';

import chalk from 'chalk';
import config from 'config';
import { Headers } from 'node-fetch';

import APIError from './apiError';
import Command, { CommandCategories } from './baseCommand';
import fetch, { cleanHeaders, handleRes } from './fetch';
import { debug } from './logger';
import readdirRecursive from './readdirRecursive';
import readDoc from './readDoc';

/**
 * Reads the contents of the specified Markdown or HTML file
 * and creates/updates the corresponding doc in ReadMe
 *
 * @param key the project API key
 * @param selectedVersion the project version
 * @param dryRun boolean indicating dry run mode
 * @param filepath path to file
 * @param type module within ReadMe to update (e.g. docs, changelogs, etc.)
 * @returns A promise-wrapped string with the result
 */
async function pushDoc(
  key: string,
  selectedVersion: string,
  dryRun: boolean,
  filepath: string,
  type: CommandCategories
) {
  const { content, data, hash, slug } = readDoc(filepath);

  let payload: {
    body?: string;
    html?: string;
    htmlmode?: boolean;
    lastUpdatedHash: string;
  } = { body: content, ...data, lastUpdatedHash: hash };

  if (type === CommandCategories.CUSTOM_PAGES) {
    if (filepath.endsWith('.html')) {
      payload = { html: content, htmlmode: true, ...data, lastUpdatedHash: hash };
    } else {
      payload = { body: content, htmlmode: false, ...data, lastUpdatedHash: hash };
    }
  }

  function createDoc() {
    if (dryRun) {
      return `🎭 dry run! This will create '${slug}' with contents from ${filepath} with the following metadata: ${JSON.stringify(
        data
      )}`;
    }

    return (
      fetch(`${config.get('host')}/api/v1/${type}`, {
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
        // eslint-disable-next-line no-underscore-dangle
        .then(res => `🌱 successfully created '${res.slug}' (ID: ${res._id}) with contents from ${filepath}`)
    );
  }

  function updateDoc(existingDoc: typeof payload) {
    if (hash === existingDoc.lastUpdatedHash) {
      return `${dryRun ? '🎭 dry run! ' : ''}\`${slug}\` ${
        dryRun ? 'will not be' : 'was not'
      } updated because there were no changes.`;
    }

    if (dryRun) {
      return `🎭 dry run! This will update '${slug}' with contents from ${filepath} with the following metadata: ${JSON.stringify(
        data
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

/**
 * Takes a path (either to a directory of files or to a single file)
 * and syncs those (either via POST or PUT) to ReadMe.
 * @returns A promise-wrapped string with the results
 */
export default async function syncDocsPath(
  /** Project API key */
  key: string,
  /** ReadMe project version */
  selectedVersion: string,
  /** module within ReadMe to update (e.g. docs, changelogs, etc.) */
  cmdType: CommandCategories,
  /** Example command usage, used in error message */
  usage: string,
  /** Path input, can either be a directory or a single file */
  pathInput: string,
  /** boolean indicating dry run mode */
  dryRun: boolean,
  /** array of allowed file extensions */
  allowedFileExtensions = ['.markdown', '.md']
) {
  if (!pathInput) {
    return Promise.reject(new Error(`No path provided. Usage \`${config.get('cli')} ${usage}\`.`));
  }

  const stat = await fs.stat(pathInput).catch(err => {
    if (err.code === 'ENOENT') {
      throw new Error("Oops! We couldn't locate a file or directory at the path you provided.");
    }
    throw err;
  });

  let output: string;

  if (stat.isDirectory()) {
    // Filter out any files that don't match allowedFileExtensions
    const files = readdirRecursive(pathInput).filter(file =>
      allowedFileExtensions.includes(path.extname(file).toLowerCase())
    );

    Command.debug(`number of files: ${files.length}`);

    if (!files.length) {
      return Promise.reject(
        new Error(
          `The directory you provided (${pathInput}) doesn't contain any of the following required files: ${allowedFileExtensions.join(
            ', '
          )}.`
        )
      );
    }

    output = (
      await Promise.all(
        files.map(async filename => {
          return pushDoc(key, selectedVersion, dryRun, filename, cmdType);
        })
      )
    ).join('\n');
  } else {
    const fileExtension = path.extname(pathInput).toLowerCase();
    if (!allowedFileExtensions.includes(fileExtension)) {
      return Promise.reject(
        new Error(
          `Invalid file extension (${fileExtension}). Must be one of the following: ${allowedFileExtensions.join(', ')}`
        )
      );
    }
    output = await pushDoc(key, selectedVersion, dryRun, pathInput, cmdType);
  }
  return Promise.resolve(chalk.green(output));
}
