const request = require('request-promise-native');

const config = require('config');
const fs = require('fs');
const editor = require('editor');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

exports.desc = 'Edit a single file from your ReadMe project without saving locally';
exports.category = 'services';
exports.weight = 3;
exports.action = 'docs:edit';

exports.run = async function({ args, opts }) {
  const { key, version } = opts;

  if (!key) {
    return Promise.reject(new Error('No api key provided. Please use --key'));
  }

  if (!version) {
    return Promise.reject(new Error('No version provided. Please use --version'));
  }

  if (!args[0]) {
    return Promise.reject(new Error('No slug provided. Usage `rdme docs:edit <slug>`'));
  }

  const slug = args[0];
  const filename = `${slug}.md`;

  const options = {
    auth: { user: key },
    headers: {
      'x-readme-version': version,
    },
  };

  const existingDoc = await request.get(`${config.host}/api/v1/docs/${slug}`, {
    json: true,
    ...options,
  }).catch(err => {
    if (err.statusCode === 404) {
      return Promise.reject(err.error);
    }

    return Promise.reject(err);
  });

  await writeFile(filename, existingDoc.body);

  return new Promise((resolve, reject) => {
    (opts.mockEditor || editor)(filename, async code => {
      if (code !== 0) return reject(new Error('Non zero exit code from $EDITOR'));
      const updatedDoc = await readFile(filename, 'utf8');

      return request
        .put(`${config.host}/api/v1/docs/${slug}`, {
          json: Object.assign(existingDoc, {
            body: updatedDoc,
          }),
          ...options,
        })
        .then(async () => {
          console.log('Doc successfully updated. Cleaning up local file');
          await unlink(filename);
          return resolve();
        })
        .catch(err => {
          if (err.statusCode === 400) {
            return reject(err.error);
          }

          return reject(err);
        });
    });
  });
};
