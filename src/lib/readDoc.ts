import type ChangelogsCommand from '../commands/changelogs.js';

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import grayMatter from 'gray-matter';

export interface PageMetadata<T = Record<string, unknown>> {
  /**
   * The contents of the Markdown file below the YAML front matter
   */
  content: string;
  /**
   * A JSON object representation of the the YAML front matter
   */
  data: T;
  /**
   * The path to the file
   */
  filePath: string;
  /**
   * A hash of the file contents (including the front matter)
   *
   * @deprecated this is no longer used in our API.
   */
  hash: string;
  /**
   * The page slug from front matter (and falls back to the filename without the extension)
   */
  slug: string;
}

/**
 * Returns the content, matter and slug of the specified Markdown or HTML file
 */
export default function readPage(
  this: ChangelogsCommand,
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
  this.debug(`front matter for ${filePath}: ${JSON.stringify(matter)}`);

  // Stripping the subdirectories and markdown extension from the filename and lowercasing to get the default slug.
  const slug = matter.data.slug || path.basename(filePath).replace(path.extname(filePath), '').toLowerCase();

  const hash = crypto.createHash('sha1').update(rawFileContents).digest('hex');
  return { content, data, filePath, hash, slug };
}
