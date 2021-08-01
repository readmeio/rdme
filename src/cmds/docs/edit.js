const request = require('request-promise-native');
const config = require('config');
const fs = require('fs');
const editor = require('editor');
const { promisify } = require('util');
const APIError = require('../../lib/apiError');
const { getProjectVersion } = require('../../lib/versionSelect');
const fetch = require('node-fetch');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

exports.command = 'docs:edit';
exports.usage = 'docs:edit <slug> [options]';
exports.description = 'Edit a single file from your ReadMe project without saving locally.';
exports.category = 'docs';
exports.position = 2;

exports.hiddenArgs = ['slug'];
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
    name: 'slug',
    type: String,
    defaultOption: true,
  },
];

exports.run = async function (opts) {
  const { slug, key, version } = opts;

  if (!key) {
    return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
  }

  if (!slug) {
    return Promise.reject(new Error(`No slug provided. Usage \`${config.cli} ${exports.usage}\`.`));
  }

  const selectedVersion = await getProjectVersion(version, key, true).catch(e => {
    return Promise.reject(e);
  });

  const filename = `${slug}.md`;
  const options = {
    auth: { user: key },
    headers: {
      'x-readme-version': selectedVersion,
    },
  };
  const encodedString = Buffer.from(`${key}:`).toString('base64');

  // const existingDoc = await request
  //   .get(`${config.host}/api/v1/docs/${slug}`, {
  //     json: true,
  //     ...options,
  //   })
  //   .catch(err => Promise.reject(new APIError(err)));

  const existingDoc = await fetch(`${config.host}/api/v1/docs/${slug}`, {
    method: 'get',
    headers: {
      'x-readme-version': selectedVersion,
      Authorization: `Basic ${encodedString}`,
      Accept: 'application/json',
    },
  })
    .then(res => res.json())
    .then(res => {
      if (res.error) {
        return Promise.reject(new APIError(res));
      }
      return res;
    });

  await writeFile(filename, existingDoc.body);

  return new Promise((resolve, reject) => {
    (opts.mockEditor || editor)(filename, async code => {
      if (code !== 0) return reject(new Error('Non zero exit code from $EDITOR'));
      const updatedDoc = await readFile(filename, 'utf8');

      // return request
      //   .put(`${config.host}/api/v1/docs/${slug}`, {
      //     json: Object.assign(existingDoc, {
      //       body: updatedDoc,
      //     }),
      //     ...options,
      //   })
      //   .then(async () => {
      //     console.log(`Doc successfully updated. Cleaning up local file.`);
      //     await unlink(filename);
      //     return resolve();
      //   })
      //   .catch(err => reject(new APIError(err)));

      return fetch(`${config.host}/api/v1/docs/${slug}`, {
        method: 'put',
        headers: {
          'x-readme-version': selectedVersion,
          Authorization: `Basic ${encodedString}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          Object.assign(existingDoc, {
            body: updatedDoc,
          })
        ),
      })
        .then(res => res.json())
        .then(async res => {
          if (res.error) {
            return reject(new APIError(res));
          }
          console.log(`Doc successfully updated. Cleaning up local file.`);
          await unlink(filename);
          return resolve();
        });
    });
  });
};
