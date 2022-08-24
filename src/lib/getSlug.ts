import fs from 'fs';
import path from 'path';

import grayMatter from 'gray-matter';

import { debug } from './logger';

/**
 * Returns the slug of the specified Markdown or HTML file
 *
 * @param {String} filepath path to the HTML/Markdown file
 *  (file extension must end in `.html`, `.md`., or `.markdown`)
 * @returns {String} a string containing the slug of the file
 */
export default function getSlug(filepath: string) {
  debug(`reading file ${filepath}`);
  const file = fs.readFileSync(filepath, 'utf8');
  const matter = grayMatter(file);
  debug(`frontmatter for ${filepath}: ${JSON.stringify(matter)}`);

  // Stripping the subdirectories and markdown extension from the filename and lowercasing to get the default slug.
  return matter.data.slug || path.basename(filepath).replace(path.extname(filepath), '').toLowerCase();
}
