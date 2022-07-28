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
 * Reads the contents of the specified Markdown or HTML file
 * and creates/updates the corresponding doc in ReadMe
 *
 * @param {String} key the project API key
 * @param {String} selectedVersion the project version
 * @param {Boolean} dryRun boolean indicating dry run mode
 * @param {String} filepath path to the HTML/Markdown file
 *  (file extension must end in `.html`, `.md`., or `.markdown`)
 * @param {String} type module within ReadMe to update (e.g. docs, changelogs, etc.)
 * @returns {Promise<String>} a string containing the result
 */
module.exports = async function pushDoc(key, selectedVersion, dryRun, filepath, type) {
  debug(`reading file ${filepath}`);
  const file = fs.readFileSync(filepath, 'utf8');
  const matter = grayMatter(file);
  debug(`frontmatter for ${filepath}: ${JSON.stringify(matter)}`);

  // Stripping the subdirectories and markdown extension from the filename and lowercasing to get the default slug.
  const slug = matter.data.slug || path.basename(filepath).replace(path.extname(filepath), '').toLowerCase();
  const hash = crypto.createHash('sha1').update(file).digest('hex');

  let data = { body: matter.content, ...matter.data, lastUpdatedHash: hash };

  if (type === 'custompages') {
    if (filepath.endsWith('.html')) {
      data = { html: matter.content, htmlmode: true, ...matter.data, lastUpdatedHash: hash };
    } else {
      data = { body: matter.content, htmlmode: false, ...matter.data, lastUpdatedHash: hash };
    }
  }

  function createDoc() {
    if (dryRun) {
      return `🎭 dry run! This will create '${slug}' with contents from ${filepath} with the following metadata: ${JSON.stringify(
        matter.data
      )}`;
    }

    return fetch(`${config.get('host')}/api/v1/${type}`, {
      method: 'post',
      headers: cleanHeaders(key, {
        'x-readme-version': selectedVersion,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        slug,
        ...data,
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

    return fetch(`${config.get('host')}/api/v1/${type}/${slug}`, {
      method: 'put',
      headers: cleanHeaders(key, {
        'x-readme-version': selectedVersion,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(
        Object.assign(existingDoc, {
          ...data,
        })
      ),
    })
      .then(res => handleRes(res))
      .then(res => `✏️ successfully updated '${res.slug}' with contents from ${filepath}`);
  }

  return fetch(`${config.get('host')}/api/v1/${type}/${slug}`, {
    method: 'get',
    headers: cleanHeaders(key, {
      'x-readme-version': selectedVersion,
      Accept: 'application/json',
    }),
  })
    .then(async res => {
      const body = await res.json();
      debug(`GET /${type}/:slug API response for ${slug}: ${JSON.stringify(body)}`);
      if (!res.ok) {
        if (res.status !== 404) return Promise.reject(new APIError(body));
        debug(`error retrieving data for ${slug}, creating doc`);
        return createDoc(body);
      }
      debug(`data received for ${slug}, updating doc`);
      return updateDoc(body);
    })
    .catch(err => {
      // eslint-disable-next-line no-param-reassign
      err.message = `Error uploading ${chalk.underline(filepath)}:\n\n${err.message}`;
      throw err;
    });
};

/**
 * Recursively grabs all files within a given directory
 * (including subdirectories)
 * @param {String} folderToSearch path to directory
 * @returns {String[]} array of files
 */
module.exports.readdirRecursive = function readdirRecursive(folderToSearch) {
  const filesInFolder = fs.readdirSync(folderToSearch, { withFileTypes: true });
  const files = filesInFolder
    .filter(fileHandle => fileHandle.isFile())
    .map(fileHandle => path.join(folderToSearch, fileHandle.name));
  const folders = filesInFolder.filter(fileHandle => fileHandle.isDirectory());
  const subFiles = [].concat(
    ...folders.map(fileHandle => readdirRecursive(path.join(folderToSearch, fileHandle.name)))
  );
  return [...files, ...subFiles];
};
