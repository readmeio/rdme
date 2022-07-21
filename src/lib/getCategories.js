const config = require('config');
const fetch = require('./fetch');
const { cleanHeaders, handleRes } = require('./fetch');

/**
 * Returns all categories for a given project and version
 *
 * @param {String} key project API key
 * @param {String} selectedVersion project version
 * @returns An array of category objects
 */
module.exports = async function getCategories(key, selectedVersion) {
  function getNumberOfPages() {
    let totalCount = 0;
    return fetch(`${config.get('host')}/api/v1/categories?perPage=20&page=1`, {
      method: 'get',
      headers: cleanHeaders(key, {
        'x-readme-version': selectedVersion,
        Accept: 'application/json',
      }),
    })
      .then(res => {
        totalCount = Math.ceil(res.headers.get('x-total-count') / 20);
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
        return fetch(`${config.get('host')}/api/v1/categories?perPage=20&page=${page}`, {
          method: 'get',
          headers: cleanHeaders(key, {
            'x-readme-version': selectedVersion,
            Accept: 'application/json',
          }),
        }).then(res => handleRes(res));
      })
    ))
  );

  return allCategories;
};
