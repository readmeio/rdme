import type grayMatter from 'gray-matter';

export interface PageObject {
  slug: string;
  doc: grayMatter.GrayMatterFile<NonSharedBuffer>;
  hash: string;
}
