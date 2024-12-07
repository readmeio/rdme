import { cleanAPIv1Headers, handleAPIv1Res, readmeAPIv1Fetch } from './readmeAPIFetch.js';

/**
 * Returns all categories for a given project and version
 *
 * @param {String} key project API key
 * @param {String} selectedVersion project version
 * @returns An array of category objects
 */
export default async function getCategories(key: string, selectedVersion: string | undefined) {
  async function getNumberOfPages() {
    let totalCount = 0;
    return readmeAPIv1Fetch('/api/v1/categories?perPage=20&page=1', {
      method: 'get',
      headers: cleanAPIv1Headers(key, selectedVersion, new Headers({ Accept: 'application/json' })),
    })
      .then(res => {
        totalCount = Math.ceil(parseInt(res.headers.get('x-total-count') || '0', 10) / 20);
        return handleAPIv1Res(res);
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
        return readmeAPIv1Fetch(`/api/v1/categories?perPage=20&page=${page}`, {
          method: 'get',
          headers: cleanAPIv1Headers(key, selectedVersion, new Headers({ Accept: 'application/json' })),
        }).then(handleAPIv1Res);
      }),
    )),
  );

  return allCategories;
}
