require('colors');
const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const config = require('config');
const crypto = require('crypto');
const frontMatter = require('gray-matter');
const { promisify } = require('util');
const APIError = require('../../lib/apiError');
const { getSwaggerVersion } = require('../../lib/versionSelect');

const readFile = promisify(fs.readFile);

exports.command = 'docs';
exports.usage = 'docs <folder> [options]';
exports.description = 'Sync a folder of markdown files to your ReadMe project.';
exports.category = 'docs';
exports.position = 1;

exports.hiddenArgs = ['folder'];
exports.args = [
  {
    name: 'key',
    type: String,
    description: 'Project API key',
  },
  {
    name: 'version',
    type: String,
    description: 'Project version',
  },
  {
    name: 'folder',
    type: String,
    defaultOption: true,
  },
];

exports.run = async function (opts) {
  const { folder, key, version } = opts;

  if (!key) {
    return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
  }

  if (!folder) {
    return Promise.reject(new Error(`No folder provided. Usage \`${config.cli} ${exports.usage}\`.`));
  }

  const selectedVersion = await getSwaggerVersion(version, key).catch(e => {
    return Promise.reject(e);
  });

  // Find the files to sync
  const readdirRecursive = folderToSearch => {
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

  // Strip out non-markdown files
  const files = readdirRecursive(folder).filter(file => file.endsWith('.md') || file.endsWith('.markdown'));
  if (!files.length) {
    return Promise.reject(new Error(`We were unable to locate Markdown files in ${folder}.`));
  }

  const options = {
    auth: { user: key },
    headers: {
      'x-readme-version': selectedVersion,
    },
  };

  function createDoc(slug, file, hash, err) {
    if (err.statusCode !== 404) return Promise.reject(err.error);

    return request
      .post(`${config.host}/api/v1/docs`, {
        json: { slug, body: file.content, ...file.data, lastUpdatedHash: hash },
        ...options,
      })
      .catch(err => Promise.reject(new APIError(err)));
  }

  function updateDoc(slug, file, hash, existingDoc) {
    if (hash === existingDoc.lastUpdatedHash) {
      return `\`${slug}\` was not updated because there were no changes.`;
    }

    return request
      .put(`${config.host}/api/v1/docs/${slug}`, {
        json: Object.assign(existingDoc, {
          body: file.content,
          ...file.data,
          lastUpdatedHash: hash,
        }),
        ...options,
      })
      .catch(err => Promise.reject(new APIError(err)));
  }

  const updatedDocs = await Promise.allSettled(
    files.map(async filename => {
      const file = await readFile(filename, 'utf8');
      const matter = frontMatter(file);

      // Stripping the subdirectories and markdown extension from the filename and lowercasing to get the default slug.
      const slug = path.basename(filename).replace(path.extname(filename), '').toLowerCase();
      const hash = crypto.createHash('sha1').update(file).digest('hex');

      return request
        .get(`${config.host}/api/v1/docs/${slug}`, {
          json: true,
          ...options,
        })
        .then(updateDoc.bind(null, slug, matter, hash), createDoc.bind(null, slug, matter, hash))
        .catch(err => {
          console.log(`\n\`${slug}\` failed to upload. ${err.message}\n`.red);
        });
    })
  );

  for (let i = 0; i < updatedDocs.length; ) {
    if (updatedDocs[i].value !== undefined) {
      updatedDocs[i] = updatedDocs[i].value; // returns only the value of the response
      i += 1;
    } else {
      updatedDocs.splice(i, 1); // we already displayed the error messages so we can filter those out
    }
  }

  return updatedDocs;
};
