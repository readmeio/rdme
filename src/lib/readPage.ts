import type ChangelogsCommand from '../commands/changelogs.js';
import type { APIv2PageCommands } from '../index.js';

import crypto from 'node:crypto';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';

import grayMatter from 'gray-matter';
import ora from 'ora';

import { oraOptions } from './logger.js';
import readdirRecursive from './readdirRecursive.js';

/**
 * The metadata for a page once it has been read.
 * This includes the Markdown contents of the file, the parsed frontmatter data,
 * the file path, and the derived slug.
 */
export interface PageMetadata<T = Record<string, unknown>> {
  /**
   * The contents of the Markdown file below the YAML frontmatter
   */
  content: string;
  /**
   * A JSON object representation of the the YAML frontmatter
   */
  data: T;
  /**
   * The path to the file
   */
  filePath: string;
  /**
   * A hash of the file contents (including the frontmatter)
   *
   * @deprecated this is no longer used in our API.
   */
  hash: string;
  /**
   * The page slug from frontmatter (and falls back to the filename without the extension)
   */
  slug: string;
}

export const allowedMarkdownExtensions: string[] = ['.markdown', '.md', '.mdx'];

/**
 * Returns the content, matter and slug of the specified Markdown or HTML file
 */
export function readPage(
  this: APIv2PageCommands | ChangelogsCommand,
  /**
   * path to the HTML/Markdown file
   * (file extension must end in `.html`, `.md`., or `.markdown`)
   */
  filePath: string,
): PageMetadata {
  this.debug(`reading file ${filePath}`);
  const rawFileContents = fs.readFileSync(filePath, 'utf8');
  // by default, grayMatter maintains a buggy cache with the page data,
  // so we pass an empty object as second argument to avoid it entirely
  // (so far we've seen this issue crop up in tests)
  const matter = grayMatter(rawFileContents, {});
  const { content, data } = matter;
  this.debug(`frontmatter for ${filePath}: ${JSON.stringify(matter)}`);

  // Stripping the subdirectories and markdown extension from the filename and lowercasing to get the default slug.
  const slug = matter.data.slug || path.basename(filePath).replace(path.extname(filePath), '').toLowerCase();

  const hash = crypto.createHash('sha1').update(rawFileContents).digest('hex');
  return { content, data, filePath, hash, slug };
}

/**
 * Takes a path input and finds pages. If the path is a directory, it will recursively search for files with the specified extensions.
 * If the path is a file, it will check if the file has a valid extension.
 *
 * Once the files are found, it reads each file and returns an array of page metadata objects (e.g., the parsed frontmatter data).
 */
export async function findPages(
  this: APIv2PageCommands | ChangelogsCommand,
  pathInput: string,
  allowedFileExtensions: string[] = allowedMarkdownExtensions,
) {
  let files: string[];

  const stat = await fsPromises.stat(pathInput).catch(err => {
    if (err.code === 'ENOENT') {
      throw new Error("Oops! We couldn't locate a file or directory at the path you provided.");
    }
    throw err;
  });

  if (stat.isDirectory()) {
    const includeHtml = allowedFileExtensions.includes('.html') ? 'and/or HTML ' : '';
    const fileScanningSpinner = ora({ ...oraOptions() }).start(
      `🔍 Looking for Markdown ${includeHtml}files in the \`${pathInput}\` directory...`,
    );
    // Filter out any files that don't match allowedFileExtensions
    files = readdirRecursive(pathInput).filter(file =>
      allowedFileExtensions.includes(path.extname(file).toLowerCase()),
    );

    if (!files.length) {
      fileScanningSpinner.fail(`${fileScanningSpinner.text} no files found.`);
      throw new Error(
        `The directory you provided (${pathInput}) doesn't contain any of the following file extensions: ${allowedFileExtensions.join(
          ', ',
        )}.`,
      );
    }

    fileScanningSpinner.succeed(`${fileScanningSpinner.text} ${files.length} file(s) found!`);
  } else {
    const fileExtension = path.extname(pathInput).toLowerCase();
    if (!allowedFileExtensions.includes(fileExtension)) {
      throw new Error(
        `Invalid file extension (${fileExtension}). Must be one of the following: ${allowedFileExtensions.join(', ')}`,
      );
    }

    files = [pathInput];
  }

  this.debug(`number of files: ${files.length}`);

  return files.map(file => readPage.call(this, file));
}
