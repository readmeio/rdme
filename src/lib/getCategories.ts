import { Headers } from 'node-fetch';

import readmeAPIFetch, { cleanHeaders, handleRes } from './readmeAPIFetch';

/**
 * Returns all categories for a given project and version
 *
 * @param {String} key project API key
 * @param {String} selectedVersion project version
 * @returns An array of category objects
 */
export default async function getCategories(key: string, selectedVersion: string) {
  function getNumberOfPages() {
    let totalCount = 0;
    return readmeAPIFetch('/api/v1/categories?perPage=20&page=1', {
      method: 'get',
      headers: cleanHeaders(
        key,
        new Headers({
          'x-readme-version': selectedVersion,
          Accept: 'application/json',
        }),
      ),
    })
      .then(res => {
        totalCount = Math.ceil(parseInt(res.headers.get('x-total-count'), 10) / 20);
        return handleRes(res);
      })
      .then(res => {
        return { firstPage: res, totalCount };
      });
  }

  const { firstPage, totalCount } = await getNumberOfPages();

  const allCategories = firstPage.concat(
    ...(await Promise.all(
      // retrieves all categories beyond first page
      [...new Array(totalCount + 1).keys()].slice(2).map(async page => {
        return readmeAPIFetch(`/api/v1/categories?perPage=20&page=${page}`, {
          method: 'get',
          headers: cleanHeaders(
            key,
            new Headers({
              'x-readme-version': selectedVersion,
              Accept: 'application/json',
            }),
          ),
        }).then(handleRes);
      }),
    )),
  );

  return allCategories;
}
