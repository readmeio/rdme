import config from 'config';
import { Headers } from 'node-fetch';

import fetch, { cleanHeaders, handleRes } from './fetch';
import getCategories from './getCategories';

type Document = {
  _id: string;
  title: string;
  slug: string;
  order: number;
  hidden: boolean;
  children: Document[];
};
async function getCategoryDocs(key: string, selectedVersion: string, category: string): Promise<Document[]> {
  return fetch(`${config.get('host')}/api/v1/categories/${category}/docs`, {
    method: 'get',
    headers: cleanHeaders(
      key,
      new Headers({
        'x-readme-version': selectedVersion,
        'Content-Type': 'application/json',
      })
    ),
  }).then(handleRes);
}

/**
 * Retrieve the docs under all categories or under a specific one
 *
 * @param {String} key the project API key
 * @param {String} selectedVersion the project version
 * @returns {Promise<Array<Document>>} an array containing the docs
 */
export default async function getDocs(key: string, selectedVersion: string): Promise<Document[]> {
  return getCategories(key, selectedVersion)
    .then(categories => categories.filter(({ type }: { type: string }) => type === 'guide'))
    .then(categories => categories.map(({ slug }: { slug: string }) => getCategoryDocs(key, selectedVersion, slug)))
    .then(Promise.all.bind(Promise))
    .then(args => [].concat(...args));
}
