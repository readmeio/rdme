import type { PageMetadata } from './readDoc.js';
import type ChangelogsCommand from '../commands/changelogs.js';
import type CustomPagesCommand from '../commands/custompages.js';
import type DocsCommand from '../commands/docs/index.js';

import fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';
import toposort from 'toposort';

import { APIv1Error } from './apiError.js';
import readdirRecursive from './readdirRecursive.js';
import readPage from './readDoc.js';
import { cleanAPIv1Headers, handleAPIv1Res, readmeAPIv1Fetch } from './readmeAPIFetch.js';

/** API path within ReadMe to update (e.g. `docs`, `changelogs`, etc.) */
type PageType = 'changelogs' | 'custompages' | 'docs';

export type PageCommand = ChangelogsCommand | CustomPagesCommand | DocsCommand;

/**
 * Reads the contents of the specified Markdown or HTML file
 * and creates/updates the corresponding doc in ReadMe
 *
 * @returns A promise-wrapped string with the result
 */
async function pushDoc(
  this: PageCommand,
  /** the project version */
  selectedVersion: string | undefined,
  fileData: PageMetadata,
) {
  const type: PageType = this.id;
  const { key, dryRun }: { dryRun: boolean; key: string } = this.flags;
  const { content, data, filePath, hash, slug } = fileData;

  // TODO: ideally we should offer a zero-configuration approach that doesn't
  // require YAML frontmatter, but that will have to be a breaking change
  if (!Object.keys(data).length) {
    this.debug(`No frontmatter attributes found for ${filePath}, not syncing`);
    return `⏭️  no frontmatter attributes found for ${filePath}, skipping`;
  }

  let payload: {
    body?: string;
    html?: string;
    htmlmode?: boolean;
    lastUpdatedHash: string;
  } = { body: content, ...data, lastUpdatedHash: hash };

  if (type === 'custompages') {
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
      readmeAPIv1Fetch(
        `/api/v1/${type}`,
        {
          method: 'post',
          headers: cleanAPIv1Headers(key, selectedVersion, new Headers({ 'Content-Type': 'application/json' })),
          body: JSON.stringify({
            slug,
            ...payload,
          }),
        },
        { filePath, fileType: 'path' },
      )
        .then(handleAPIv1Res)
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

    return readmeAPIv1Fetch(
      `/api/v1/${type}/${slug}`,
      {
        method: 'put',
        headers: cleanAPIv1Headers(key, selectedVersion, new Headers({ 'Content-Type': 'application/json' })),
        body: JSON.stringify(payload),
      },
      { filePath, fileType: 'path' },
    )
      .then(handleAPIv1Res)
      .then(res => `✏️ successfully updated '${res.slug}' with contents from ${filePath}`);
  }

  return readmeAPIv1Fetch(`/api/v1/${type}/${slug}`, {
    method: 'get',
    headers: cleanAPIv1Headers(key, selectedVersion, new Headers({ Accept: 'application/json' })),
  })
    .then(async res => {
      const body = await handleAPIv1Res(res, false);
      if (!res.ok) {
        if (res.status !== 404) return Promise.reject(new APIv1Error(body));
        this.debug(`error retrieving data for ${slug}, creating doc`);
        return createDoc();
      }
      this.debug(`data received for ${slug}, updating doc`);
      return updateDoc(body);
    })
    .catch(err => {
      // eslint-disable-next-line no-param-reassign
      err.message = `Error uploading ${chalk.underline(filePath)}:\n\n${err.message}`;
      throw err;
    });
}

const byParentDoc = (left: PageMetadata, right: PageMetadata) => {
  return (right.data.parentDoc ? 1 : 0) - (left.data.parentDoc ? 1 : 0);
};

/**
 * Sorts files based on their parentDoc attribute. If a file has a parentDoc attribute,
 * it will be sorted after the file it references.
 *
 * @see {@link https://github.com/readmeio/rdme/pull/973}
 * @returns An array of sorted PageMetadata objects
 */
function sortFiles(this: PageCommand, filePaths: string[]): PageMetadata[] {
  const files = filePaths.map(file => readPage.call(this, file)).sort(byParentDoc);
  const filesBySlug = files.reduce<Record<string, PageMetadata>>((bySlug, obj) => {
    // eslint-disable-next-line no-param-reassign
    bySlug[obj.slug] = obj;
    return bySlug;
  }, {});
  const dependencies = Object.values(filesBySlug).reduce<[PageMetadata, PageMetadata][]>((edges, obj) => {
    if (obj.data.parentDocSlug && filesBySlug[obj.data.parentDocSlug as string]) {
      edges.push([filesBySlug[obj.data.parentDocSlug as string], filesBySlug[obj.slug]]);
    }

    return edges;
  }, []);

  return toposort.array(files, dependencies);
}

/**
 * Takes a path (either to a directory of files or to a single file)
 * and syncs those (either via POST or PUT) to ReadMe.
 * @returns A promise-wrapped string with the results
 *
 * @deprecated This is for APIv1 only. Use `syncDocsPath.ts` instead, if possible.
 */
export default async function syncDocsPath(
  this: PageCommand,
  /** ReadMe project version */
  selectedVersion?: string,
) {
  const { path: pathInput }: { path: string } = this.args;

  const allowedFileExtensions = ['.markdown', '.md'];
  // we allow HTML files in custom pages
  if (this.id === 'custompages') {
    allowedFileExtensions.unshift('.html');
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

    this.debug(`number of files: ${files.length}`);

    if (!files.length) {
      return Promise.reject(
        new Error(
          `The directory you provided (${pathInput}) doesn't contain any of the following required files: ${allowedFileExtensions.join(
            ', ',
          )}.`,
        ),
      );
    }
    let sortedFiles;

    try {
      sortedFiles = sortFiles.call(this, files);
    } catch (e) {
      return Promise.reject(e);
    }

    output = (
      await Promise.all(
        sortedFiles.map(async fileData => {
          return pushDoc.call(this, selectedVersion, fileData);
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

    const fileData = readPage.call(this, pathInput);
    output = await pushDoc.call(this, selectedVersion, fileData);
  }
  return Promise.resolve(chalk.green(output));
}
