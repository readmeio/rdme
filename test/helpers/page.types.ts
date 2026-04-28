import type grayMatter from 'gray-matter';

export interface PageObject {
  doc: grayMatter.GrayMatterFile<NonSharedBuffer>;
  hash: string;
  slug: string;
}
