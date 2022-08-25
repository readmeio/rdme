import type matter from 'gray-matter';

import fs from 'fs';
import path from 'path';

import grayMatter from 'gray-matter';

import { debug } from './logger';

type DocMetadata = {
  content: string;
  matter: matter.GrayMatterFile<string>;
  slug: string;
};

/**
 * Returns the content, matter and slug of the specified Markdown or HTML file
 *
 * @param {String} filepath path to the HTML/Markdown file
 *  (file extension must end in `.html`, `.md`., or `.markdown`)
 * @returns {DocMetadata} an object containing the file's content, matter, and slug
 */
export default function readDoc(filepath: string): DocMetadata {
  debug(`reading file ${filepath}`);
  const content = fs.readFileSync(filepath, 'utf8');
  const matter = grayMatter(content);
  debug(`frontmatter for ${filepath}: ${JSON.stringify(matter)}`);

  // Stripping the subdirectories and markdown extension from the filename and lowercasing to get the default slug.
  const slug = matter.data.slug || path.basename(filepath).replace(path.extname(filepath), '').toLowerCase();
  return { content, matter, slug };
}
