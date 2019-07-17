const request = require('request-promise-native');
const config = require('config');
const fs = require('fs');
const editor = require('editor');
const { promisify } = require('util');
const program = require('yargs');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

exports.command = 'docs:edit';
exports.desc = 'Edit a single file from your ReadMe project without saving locally';
exports.category = 'services';
exports.weight = 4;

exports.builder = yargs => {
  yargs.usage(`Usage: $0 docs:edit <slug> [arguments]\n\n${exports.desc}`);
  yargs.positional('slug', {
    describe: 'Your project file slug.',
  });

  yargs.option('key', {
    describe: 'Your project API key.',
    string: true,
  });

  // @todo rename to version
  yargs.option('vers', {
    describe: 'Your project version.',
    string: true,
  });
};

exports.handler = async function(opts) {
  const slug = typeof opts._ !== 'undefined' ? opts._[1] : undefined;
  const { key, vers } = opts;
  const version = vers;

  if (!slug && !key && !version) {
    return program.showHelp();
  }

  if (!key) {
    return Promise.reject(new Error('No API key provided. Please use --key.'));
  }

  if (!version) {
    return Promise.reject(new Error('No project version provided. Please use --version.'));
  }

  if (!slug) {
    return Promise.reject(
      new Error('No project file slug provided. Usage `rdme docs:edit <slug>`'),
    );
  }

  const filename = `${slug}.md`;

  const options = {
    auth: { user: key },
    headers: {
      'x-readme-version': version,
    },
  };

  const existingDoc = await request
    .get(`${config.host}/api/v1/docs/${slug}`, {
      json: true,
      ...options,
    })
    .catch(err => {
      if (err.statusCode === 404) {
        return Promise.reject(err.error);
      }

      return Promise.reject(err);
    });

  await writeFile(filename, existingDoc.body);

  return new Promise((resolve, reject) => {
    (opts.mockEditor || editor)(filename, async code => {
      if (code !== 0) return reject(new Error('Non zero exit code from $EDITOR.'));
      const updatedDoc = await readFile(filename, 'utf8');

      return request
        .put(`${config.host}/api/v1/docs/${slug}`, {
          json: Object.assign(existingDoc, {
            body: updatedDoc,
          }),
          ...options,
        })
        .then(async () => {
          console.log('Doc successfully updated. Cleaning up local file.');
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
