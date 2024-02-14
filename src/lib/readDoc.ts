import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import grayMatter from 'gray-matter';

import { debug } from './logger.js';

export interface ReadDocMetadata {
  /** The contents of the file below the YAML front matter */
  content: string;
  /** A JSON object with the YAML front matter */
  data: Record<string, unknown>;
  /** The original filePath */
  filePath: string;
  /**
   * A hash of the file contents (including the front matter)
   */
  hash: string;
  /** The page slug */
  slug: string;
}

/**
 * Returns the content, matter and slug of the specified Markdown or HTML file
 *
 * @param {String} filePath path to the HTML/Markdown file
 *  (file extension must end in `.html`, `.md`., or `.markdown`)
 */
export default function readDoc(filePath: string): ReadDocMetadata {
  debug(`reading file ${filePath}`);
  const rawFileContents = fs.readFileSync(filePath, 'utf8');
  const matter = grayMatter(rawFileContents);
  const { content, data } = matter;
  debug(`front matter for ${filePath}: ${JSON.stringify(matter)}`);

  // Stripping the subdirectories and markdown extension from the filename and lowercasing to get the default slug.
  const slug = matter.data.slug || path.basename(filePath).replace(path.extname(filePath), '').toLowerCase();

  const hash = crypto.createHash('sha1').update(rawFileContents).digest('hex');
  return { content, data, filePath, hash, slug };
}
