const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const config = require('config');
const crypto = require('crypto');
const frontMatter = require('gray-matter');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

exports.command = 'docs';
exports.usage = 'docs <folder> [options]';
exports.description = 'Sync a folder of markdown files to your ReadMe project.';
exports.category = 'docs';
exports.weight = 3;

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

exports.run = function(opts) {
  const { folder, key, version } = opts;

  if (!key) {
    return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
  }

  if (!version) {
    return Promise.reject(new Error('No project version provided. Please use `--version`.'));
  }

  if (!folder) {
    return Promise.reject(
      new Error(`No folder provided. Usage \`${config.cli} ${exports.usage}\`.`),
    );
  }

  const files = fs
    .readdirSync(folder)
    .filter(file => file.endsWith('.md') || file.endsWith('.markdown'));

  const options = {
    auth: { user: key },
    headers: {
      'x-readme-version': version,
    },
  };

  function validationErrors(err) {
    if (err.statusCode === 400) {
      return Promise.reject(err.error);
    }

    return Promise.reject(err);
  }

  function createDoc(slug, file, hash, err) {
    if (err.statusCode !== 404) return Promise.reject(err.error);

    return request
      .post(`${config.host}/api/v1/docs`, {
        json: { slug, body: file.content, ...file.data, lastUpdatedHash: hash },
        ...options,
      })
      .catch(validationErrors);
  }

  function updateDoc(slug, file, hash, existingDoc) {
    if (hash === existingDoc.lastUpdatedHash) {
      return `\`${slug}\` not updated. No changes.`;
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
      .catch(validationErrors);
  }

  return Promise.all(
    files.map(async filename => {
      const file = await readFile(path.join(folder, filename), 'utf8');
      const matter = frontMatter(file);
      // Stripping the markdown extension from the filename
      const slug = filename.replace(path.extname(filename), '');
      const hash = crypto
        .createHash('sha1')
        .update(file)
        .digest('hex');

      return request
        .get(`${config.host}/api/v1/docs/${slug}`, {
          json: true,
          ...options,
        })
        .then(updateDoc.bind(null, slug, matter, hash), createDoc.bind(null, slug, matter, hash))
        .catch(err => {
          return Promise.reject(err);
        });
    }),
  );
};
