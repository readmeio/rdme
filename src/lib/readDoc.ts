import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import grayMatter from 'gray-matter';

import { debug } from './logger';

interface ReadDocMetadata {
  /** The contents of the file below the YAML front matter */
  content: string;
  /** A JSON object with the YAML front matter */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
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
 * @param {String} filepath path to the HTML/Markdown file
 *  (file extension must end in `.html`, `.md`., or `.markdown`)
 */
export default function readDoc(filepath: string): ReadDocMetadata {
  debug(`reading file ${filepath}`);
  const rawFileContents = fs.readFileSync(filepath, 'utf8');
  const matter = grayMatter(rawFileContents);
  const { content, data } = matter;
  debug(`front matter for ${filepath}: ${JSON.stringify(matter)}`);

  // Stripping the subdirectories and markdown extension from the filename and lowercasing to get the default slug.
  const slug = matter.data.slug || path.basename(filepath).replace(path.extname(filepath), '').toLowerCase();

  const hash = crypto.createHash('sha1').update(rawFileContents).digest('hex');
  return { content, data, hash, slug };
}
