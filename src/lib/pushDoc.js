const chalk = require('chalk');
const config = require('config');
const crypto = require('crypto');
const fs = require('fs');
const grayMatter = require('gray-matter');
const path = require('path');

const APIError = require('./apiError');
const { cleanHeaders, handleRes } = require('./fetch');
const fetch = require('./fetch');
const { debug } = require('./logger');

/**
 * Reads the contents of the specified Markdown file
 * and creates/updates the doc in ReadMe
 *
 * @param {String} key the project API key
 * @param {String} selectedVersion the project version
 * @param {Boolean} dryRun boolean indicating dry run mode
 * @param {String} filepath path to the Markdown file
 *  (file extension must end in `.md` or `.markdown`)
 * @returns {Promise<String>} a string containing the result
 */
module.exports = async function pushDoc(key, selectedVersion, dryRun, filepath) {
  debug(`reading file ${filepath}`);
  const file = fs.readFileSync(filepath, 'utf8');
  const matter = grayMatter(file);
  debug(`frontmatter for ${filepath}: ${JSON.stringify(matter)}`);

  // Stripping the subdirectories and markdown extension from the filename and lowercasing to get the default slug.
  const slug = matter.data.slug || path.basename(filepath).replace(path.extname(filepath), '').toLowerCase();
  const hash = crypto.createHash('sha1').update(file).digest('hex');

  function createDoc(err) {
    if (err.error !== 'DOC_NOTFOUND') return Promise.reject(new APIError(err));

    if (dryRun) {
      return `🎭 dry run! This will create '${slug}' with contents from ${filepath} with the following metadata: ${JSON.stringify(
        matter.data
      )}`;
    }

    return fetch(`${config.get('host')}/api/v1/docs`, {
      method: 'post',
      headers: cleanHeaders(key, {
        'x-readme-version': selectedVersion,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        slug,
        body: matter.content,
        ...matter.data,
        lastUpdatedHash: hash,
      }),
    })
      .then(res => handleRes(res))
      .then(res => `🌱 successfully created '${res.slug}' with contents from ${filepath}`);
  }

  function updateDoc(existingDoc) {
    if (hash === existingDoc.lastUpdatedHash) {
      return `${dryRun ? '🎭 dry run! ' : ''}\`${slug}\` ${
        dryRun ? 'will not be' : 'was not'
      } updated because there were no changes.`;
    }

    if (dryRun) {
      return `🎭 dry run! This will update '${slug}' with contents from ${filepath} with the following metadata: ${JSON.stringify(
        matter.data
      )}`;
    }

    return fetch(`${config.get('host')}/api/v1/docs/${slug}`, {
      method: 'put',
      headers: cleanHeaders(key, {
        'x-readme-version': selectedVersion,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(
        Object.assign(existingDoc, {
          body: matter.content,
          ...matter.data,
          lastUpdatedHash: hash,
        })
      ),
    })
      .then(res => handleRes(res))
      .then(res => `✏️ successfully updated '${res.slug}' with contents from ${filepath}`);
  }

  return fetch(`${config.get('host')}/api/v1/docs/${slug}`, {
    method: 'get',
    headers: cleanHeaders(key, {
      'x-readme-version': selectedVersion,
      Accept: 'application/json',
    }),
  })
    .then(res => res.json())
    .then(res => {
      debug(`GET /docs/:slug API response for ${slug}: ${JSON.stringify(res)}`);
      if (res.error) {
        debug(`error retrieving data for ${slug}, creating doc`);
        return createDoc(res);
      }
      debug(`data received for ${slug}, updating doc`);
      return updateDoc(res);
    })
    .catch(err => {
      // eslint-disable-next-line no-param-reassign
      err.message = `Error uploading ${chalk.underline(filepath)}:\n\n${err.message}`;
      throw err;
    });
};
