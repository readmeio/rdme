import getCategories from './getCategories.js';
import { cleanAPIv1Headers, handleAPIv1Res, readmeAPIv1Fetch } from './readmeAPIFetch.js';

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
  const docs: Document[] = ([] as Document[]).concat(...data);
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

async function getCategoryDocs(
  key: string,
  selectedVersion: string | undefined,
  category: string,
): Promise<Document[]> {
  return readmeAPIv1Fetch(`/api/v1/categories/${category}/docs`, {
    method: 'get',
    headers: cleanAPIv1Headers(key, selectedVersion, new Headers({ 'Content-Type': 'application/json' })),
  }).then(handleAPIv1Res);
}

/**
 * Retrieve the docs under all categories
 *
 * @param {String} key the project API key
 * @param {String} selectedVersion the project version
 * @returns {Promise<Array<Document>>} an array containing the docs
 */
export default async function getDocs(key: string, selectedVersion: string | undefined): Promise<Document[]> {
  return getCategories(key, selectedVersion)
    .then(categories => categories.filter(({ type }: { type: string }) => type === 'guide'))
    .then(categories => categories.map(({ slug }: { slug: string }) => getCategoryDocs(key, selectedVersion, slug)))
    .then(categoryDocsPromises => Promise.all(categoryDocsPromises))
    .then(flatten);
}
