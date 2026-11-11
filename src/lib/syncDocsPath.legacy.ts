import type ChangelogsCommand from '../commands/changelogs.js';
import type { PageMetadata } from './readPage.js';

import fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';
import toposort from 'toposort';

import { isRecord } from '../utils.js';

import { APIv1Error } from './apiError.js';
import readdirRecursive from './readdirRecursive.js';
import { cleanAPIv1Headers, handleAPIv1Res, readmeAPIv1Fetch } from './readmeAPIFetch.js';
import { readPage } from './readPage.js';
import { assertSlug } from './slug.js';

/**
 * SEO fields stored on a v1 changelog. Other keys are dropped so this object
 * cannot carry arbitrary properties.
 */
interface ChangelogMetadata {
  description?: unknown;
  image?: unknown;
  keywords?: unknown;
  title?: unknown;
}

const CHANGELOG_METADATA_KEYS = ['description', 'image', 'keywords', 'title'] as const;

/**
 * Body written to `POST` or `PUT /api/v1/changelogs`. `slug` is added on create.
 * `lastUpdatedHash` is the file hash rdme uses to skip unchanged posts.
 */
interface ChangelogPayload {
  body: string;
  hidden?: unknown;
  lastUpdatedHash: string;
  metadata?: ChangelogMetadata;
  title?: unknown;
  type?: unknown;
}

type PreparedChangelog =
  | { filePath: string; skipped: true }
  | { filePath: string; payload: ChangelogPayload; skipped: false; slug: string };

function changelogMetadata(value: unknown): ChangelogMetadata | undefined {
  if (!isRecord(value)) return undefined;

  const metadata: ChangelogMetadata = {};
  for (const key of CHANGELOG_METADATA_KEYS) {
    if (Object.hasOwn(value, key)) metadata[key] = value[key];
  }

  return Object.keys(metadata).length ? metadata : undefined;
}

function changelogPayload(content: string, data: PageMetadata['data'], hash: string): ChangelogPayload {
  const payload: ChangelogPayload = {
    body: content,
    lastUpdatedHash: hash,
  };

  if (Object.hasOwn(data, 'hidden')) payload.hidden = data.hidden;
  const metadata = changelogMetadata(data.metadata);
  if (metadata) payload.metadata = metadata;
  if (Object.hasOwn(data, 'title')) payload.title = data.title;
  if (Object.hasOwn(data, 'type')) payload.type = data.type;

  return payload;
}

/**
 * Skip files with no frontmatter. Otherwise require the slug to be one URL path
 * segment and return the body that will be sent.
 */
function prepareChangelog(fileData: PageMetadata): PreparedChangelog {
  if (!Object.keys(fileData.data).length) return { filePath: fileData.filePath, skipped: true };

  return {
    filePath: fileData.filePath,
    payload: changelogPayload(fileData.content, fileData.data, fileData.hash),
    skipped: false,
    slug: assertSlug(fileData.slug, fileData.filePath),
  };
}

/**
 * Reads the contents of the specified Markdown or HTML file
 * and creates/updates the corresponding doc in ReadMe
 *
 * @returns A promise-wrapped string with the result
 */
async function pushDoc(
  this: ChangelogsCommand,
  /** the project version */
  selectedVersion: string | undefined,
  prepared: PreparedChangelog,
) {
  const type: 'changelogs' = this.id;
  const { key, dryRun }: { dryRun: boolean; key: string } = this.flags;
  const { filePath } = prepared;

  // TODO: ideally we should offer a zero-configuration approach that doesn't
  // require YAML frontmatter, but that will have to be a breaking change
  if (prepared.skipped) {
    this.debug(`No frontmatter attributes found for ${filePath}, not syncing`);
    return `⏭️  no frontmatter attributes found for ${filePath}, skipping`;
  }

  const { payload, slug } = prepared;
  const slugPath = encodeURIComponent(slug);

  function createDoc() {
    const requestBody = { ...payload, slug };

    if (dryRun) {
      return `🎭 dry run! This will create '${slug}' with contents from ${filePath} with the following metadata: ${JSON.stringify(
        requestBody,
      )}`;
    }

    return readmeAPIv1Fetch(
      `/api/v1/${type}`,
      {
        method: 'post',
        headers: cleanAPIv1Headers(key, selectedVersion, new Headers({ 'Content-Type': 'application/json' })),
        body: JSON.stringify(requestBody),
      },
      {
        file: {
          path: filePath,
          type: 'path',
        },
      },
    )
      .then(handleAPIv1Res)
      .then(res => `🌱 successfully created '${res.slug}' (ID: ${res._id}) with contents from ${filePath}`);
  }

  function updateDoc(existingDoc: { lastUpdatedHash?: string }) {
    if (payload.lastUpdatedHash === existingDoc.lastUpdatedHash) {
      return `${dryRun ? '🎭 dry run! ' : ''}\`${slug}\` ${
        dryRun ? 'will not be' : 'was not'
      } updated because there were no changes.`;
    }

    if (dryRun) {
      return `🎭 dry run! This will update '${slug}' with contents from ${filePath} with the following metadata: ${JSON.stringify(
        payload,
      )}`;
    }

    return readmeAPIv1Fetch(
      `/api/v1/${type}/${slugPath}`,
      {
        method: 'put',
        headers: cleanAPIv1Headers(key, selectedVersion, new Headers({ 'Content-Type': 'application/json' })),
        body: JSON.stringify(payload),
      },
      {
        file: {
          path: filePath,
          type: 'path',
        },
      },
    )
      .then(handleAPIv1Res)
      .then(res => `✏️ successfully updated '${res.slug}' with contents from ${filePath}`);
  }

  return readmeAPIv1Fetch(`/api/v1/${type}/${slugPath}`, {
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
      // oxlint-disable-next-line no-param-reassign
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
function sortFiles(this: ChangelogsCommand, filePaths: string[]): PageMetadata[] {
  const files = filePaths.map(file => readPage.call(this, file)).toSorted(byParentDoc);
  // A plain object keyed by slug treats `__proto__` and `constructor` as special.
  const filesBySlug = new Map(files.map(file => [file.slug, file]));

  const dependencies: [PageMetadata, PageMetadata][] = [];
  for (const file of filesBySlug.values()) {
    const parentSlug = file.data.parentDocSlug;
    const parent = typeof parentSlug === 'string' ? filesBySlug.get(parentSlug) : undefined;
    if (parent) dependencies.push([parent, file]);
  }

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
  this: ChangelogsCommand,
  /** ReadMe project version */
  selectedVersion?: string,
) {
  const { path: pathInput }: { path: string } = this.args;

  const allowedFileExtensions = ['.markdown', '.md'];

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

    let sortedFiles: PageMetadata[];
    try {
      sortedFiles = sortFiles.call(this, files);
    } catch (e) {
      return Promise.reject(e);
    }

    // Prepare every file before the first request so one bad slug cannot race a sibling upload.
    const preparedFiles = sortedFiles.map(fileData => prepareChangelog(fileData));

    output = (await Promise.all(preparedFiles.map(prepared => pushDoc.call(this, selectedVersion, prepared)))).join(
      '\n',
    );
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
    output = await pushDoc.call(this, selectedVersion, prepareChangelog(fileData));
  }
  return Promise.resolve(chalk.green(output));
}
