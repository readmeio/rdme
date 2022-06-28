const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const config = require('config');
const crypto = require('crypto');
const frontMatter = require('gray-matter');
const { promisify } = require('util');
const { getProjectVersion } = require('../../lib/versionSelect');
const fetch = require('../../lib/fetch');
const { cleanHeaders, handleRes } = require('../../lib/fetch');
const { debug } = require('../../lib/logger');

const readFile = promisify(fs.readFile);

module.exports = class CreateDocCommand {
  constructor() {
    this.command = 'docs:create';
    this.usage = 'docs:create <filepath> [options]';
    this.description = 'Sync a single markdown file to your ReadMe project.';
    this.category = 'docs';
    this.position = 1;

    this.hiddenArgs = ['filepath'];
    this.args = [
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
        name: 'filepath',
        type: String,
        defaultOption: true,
      },
      {
        name: 'dryRun',
        type: Boolean,
        description: 'Runs the command without creating/updating any docs in ReadMe. Useful for debugging.',
      },
    ];
  }

  async run(opts) {
    const { dryRun, filepath, key, version } = opts;
    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    if (!filepath) {
      return Promise.reject(new Error(`No filepath provided. Usage \`${config.get('cli')} ${this.usage}\`.`));
    }

    if (filepath.endsWith('.md') === false || !filepath.endsWith('.markdown') === false) {
      return Promise.reject(new Error('The filepath specified is not a markdown file.'));
    }

    // TODO: should we allow version selection at all here?
    // Let's revisit this once we re-evaluate our category logic in the API.
    // Ideally we should ignore this parameter entirely if the category is included.
    const selectedVersion = await getProjectVersion(version, key, false);

    debug(`selectedVersion: ${selectedVersion}`);

    debug(`reading file ${filepath}`);
    const file = await readFile(filepath, 'utf8');
    const matter = frontMatter(file);
    debug(`frontmatter for ${filepath}: ${JSON.stringify(matter)}`);

    // Stripping the subdirectories and markdown extension from the filename and lowercasing to get the default slug.
    const slug = matter.data.slug || path.basename(filepath).replace(path.extname(filepath), '').toLowerCase();
    const hash = crypto.createHash('sha1').update(file).digest('hex');

    function createDoc(err) {
      if (err.error !== 'DOC_NOTFOUND') return Promise.reject(err);

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

    debug(`creating doc for ${slug}`);
    const createdDoc = await fetch(`${config.get('host')}/api/v1/docs/${slug}`, {
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

    return chalk.green(createdDoc);
  }
};
