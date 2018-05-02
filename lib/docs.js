const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const config = require('config');
const frontMatter = require('gray-matter');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

exports.desc = 'Sync a folder of markdown files to your ReadMe project';
exports.category = 'services';
exports.weight = 2;

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
      console.log(err.error);
      return Promise.reject();
    };

    return Promise.reject(err);
  }

  function createDoc(slug, file, err) {
    if (err.statusCode !== 404) return Promise.reject(err.error);

    return request.post(`${config.host}/api/v1/docs`, {
      json: { slug, body: file.content, ...file.data },
      ...options,
    }).catch(validationErrors);
  }

  function updateDoc(slug, file, existingDoc) {
    return request.put(`${config.host}/api/v1/docs/${slug}`, {
      json: Object.assign(existingDoc, { body: file.content, ...file.data }),
      ...options,
    }).catch(validationErrors);
  }

  return Promise.all(
    files.map(async filename => {
      const file = frontMatter(await readFile(path.join(args[0], filename), 'utf8'));
      // Stripping the markdown extension from the filename
      const slug = filename.replace(path.extname(filename), '');

      return request.get(`${config.host}/api/v1/docs/${slug}`, {
        json: true,
        ...options,
      }).then(updateDoc.bind(null, slug, file), createDoc.bind(null, slug, file));
    }),
  );
};
