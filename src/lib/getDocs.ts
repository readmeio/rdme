import { Headers } from 'node-fetch';

import getCategories from './getCategories';
import readmeAPIFetch, { cleanHeaders, handleRes } from './readmeAPIFetch';

interface Document {
  _id: string;
  children: Document[];
  hidden: boolean;
  order: number;
  slug: string;
  title: string;
}

function flatten(data: Document[][]): Document[] {
  const allDocs: Document[] = [];
  const docs: Document[] = [].concat(...data);
  docs.forEach(doc => {
    allDocs.push(doc);
    if (doc.children) {
      doc.children.forEach(child => {
        allDocs.push(child);
      });
    }
  });

  // Docs with children cannot be deleted unless the children are deleted first,
  // so move those parent docs to the back of the list
  allDocs.sort(a => (a.children?.length ? 1 : -1));

  return allDocs;
}

async function getCategoryDocs(key: string, selectedVersion: string, category: string): Promise<Document[]> {
  return readmeAPIFetch(`/api/v1/categories/${category}/docs`, {
    method: 'get',
    headers: cleanHeaders(
      key,
      new Headers({
        'x-readme-version': selectedVersion,
        'Content-Type': 'application/json',
      }),
    ),
  }).then(handleRes);
}

/**
 * Retrieve the docs under all categories
 *
 * @param {String} key the project API key
 * @param {String} selectedVersion the project version
 * @returns {Promise<Array<Document>>} an array containing the docs
 */
export default async function getDocs(key: string, selectedVersion: string): Promise<Document[]> {
  return getCategories(key, selectedVersion)
    .then(categories => categories.filter(({ type }: { type: string }) => type === 'guide'))
    .then(categories => categories.map(({ slug }: { slug: string }) => getCategoryDocs(key, selectedVersion, slug)))
    .then(categoryDocsPromises => Promise.all(categoryDocsPromises))
    .then(flatten);
}
