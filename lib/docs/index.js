const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const config = require('config');
const crypto = require('crypto');
const frontMatter = require('gray-matter');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

exports.desc = 'Sync a folder of markdown files to your ReadMe project';
exports.category = 'services';
exports.weight = 3;
exports.action = 'docs';

exports.run = function({ args, opts }) {
  const { key, version } = opts;

  if (!key) {
    return Promise.reject(new Error('No api key provided. Please use --key'));
  }

  if (!version) {
    return Promise.reject(new Error('No version provided. Please use --version'));
  }

  if (!args[0]) {
    return Promise.reject(new Error('No folder provided. Usage `rdme docs <folder>`'));
  }

  const files = fs
    .readdirSync(args[0])
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
    if (hash === existingDoc.lastUpdatedHash) return undefined;
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
      const file = await readFile(path.join(args[0], filename), 'utf8');
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
        .then(updateDoc.bind(null, slug, matter, hash), createDoc.bind(null, slug, matter, hash));
    }),
  );
};
