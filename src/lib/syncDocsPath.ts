import fs from 'fs/promises';
import path from 'path';

import chalk from 'chalk';
import config from 'config';
import { Headers } from 'node-fetch';

import APIError from './apiError';
import Command, { CommandCategories } from './baseCommand';
import { debug } from './logger';
import readdirRecursive from './readdirRecursive';
import readDoc from './readDoc';
import readmeAPIFetch, { cleanHeaders, handleRes } from './readmeAPIFetch';

/**
 * Reads the contents of the specified Markdown or HTML file
 * and creates/updates the corresponding doc in ReadMe
 *
 * @param key the project API key
 * @param selectedVersion the project version
 * @param dryRun boolean indicating dry run mode
 * @param filePath path to file
 * @param type module within ReadMe to update (e.g. docs, changelogs, etc.)
 * @returns A promise-wrapped string with the result
 */
async function pushDoc(
  key: string,
  selectedVersion: string,
  dryRun: boolean,
  filePath: string,
  type: CommandCategories,
) {
  const { content, data, hash, slug } = readDoc(filePath);

  // TODO: ideally we should offer a zero-configuration approach that doesn't
  // require YAML front matter, but that will have to be a breaking change
  if (!Object.keys(data).length) {
    debug(`No front matter attributes found for ${filePath}, not syncing`);
    return `⏭️  no front matter attributes found for ${filePath}, skipping`;
  }

  let payload: {
    body?: string;
    html?: string;
    htmlmode?: boolean;
    lastUpdatedHash: string;
  } = { body: content, ...data, lastUpdatedHash: hash };

  if (type === CommandCategories.CUSTOM_PAGES) {
    if (filePath.endsWith('.html')) {
      payload = { html: content, htmlmode: true, ...data, lastUpdatedHash: hash };
    } else {
      payload = { body: content, htmlmode: false, ...data, lastUpdatedHash: hash };
    }
  }

  function createDoc() {
    if (dryRun) {
      return `🎭 dry run! This will create '${slug}' with contents from ${filePath} with the following metadata: ${JSON.stringify(
        data,
      )}`;
    }

    return (
      readmeAPIFetch(
        `/api/v1/${type}`,
        {
          method: 'post',
          headers: cleanHeaders(
            key,
            new Headers({
              'x-readme-version': selectedVersion,
              'Content-Type': 'application/json',
            }),
          ),
          body: JSON.stringify({
            slug,
            ...payload,
          }),
        },
        { filePath, fileType: 'path' },
      )
        .then(handleRes)
        // eslint-disable-next-line no-underscore-dangle
        .then(res => `🌱 successfully created '${res.slug}' (ID: ${res._id}) with contents from ${filePath}`)
    );
  }

  function updateDoc(existingDoc: typeof payload) {
    if (hash === existingDoc.lastUpdatedHash) {
      return `${dryRun ? '🎭 dry run! ' : ''}\`${slug}\` ${
        dryRun ? 'will not be' : 'was not'
      } updated because there were no changes.`;
    }

    if (dryRun) {
      return `🎭 dry run! This will update '${slug}' with contents from ${filePath} with the following metadata: ${JSON.stringify(
        data,
      )}`;
    }

    return readmeAPIFetch(
      `/api/v1/${type}/${slug}`,
      {
        method: 'put',
        headers: cleanHeaders(
          key,
          new Headers({
            'x-readme-version': selectedVersion,
            'Content-Type': 'application/json',
          }),
        ),
        body: JSON.stringify(payload),
      },
      { filePath, fileType: 'path' },
    )
      .then(handleRes)
      .then(res => `✏️ successfully updated '${res.slug}' with contents from ${filePath}`);
  }

  return readmeAPIFetch(`/api/v1/${type}/${slug}`, {
    method: 'get',
    headers: cleanHeaders(
      key,
      new Headers({
        'x-readme-version': selectedVersion,
        Accept: 'application/json',
      }),
    ),
  })
    .then(async res => {
      const body = await handleRes(res, false);
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
      err.message = `Error uploading ${chalk.underline(filePath)}:\n\n${err.message}`;
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
  allowedFileExtensions = ['.markdown', '.md'],
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
      allowedFileExtensions.includes(path.extname(file).toLowerCase()),
    );

    Command.debug(`number of files: ${files.length}`);

    if (!files.length) {
      return Promise.reject(
        new Error(
          `The directory you provided (${pathInput}) doesn't contain any of the following required files: ${allowedFileExtensions.join(
            ', ',
          )}.`,
        ),
      );
    }

    output = (
      await Promise.all(
        files.map(async filename => {
          return pushDoc(key, selectedVersion, dryRun, filename, cmdType);
        }),
      )
    ).join('\n');
  } else {
    const fileExtension = path.extname(pathInput).toLowerCase();
    if (!allowedFileExtensions.includes(fileExtension)) {
      return Promise.reject(
        new Error(
          `Invalid file extension (${fileExtension}). Must be one of the following: ${allowedFileExtensions.join(
            ', ',
          )}`,
        ),
      );
    }
    output = await pushDoc(key, selectedVersion, dryRun, pathInput, cmdType);
  }
  return Promise.resolve(chalk.green(output));
}
