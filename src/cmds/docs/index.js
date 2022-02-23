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

module.exports = class DocsCommand {
  constructor() {
    this.command = 'docs';
    this.usage = 'docs <folder> [options]';
    this.description = 'Sync a folder of markdown files to your ReadMe project.';
    this.category = 'docs';
    this.position = 1;

    this.hiddenArgs = ['folder'];
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
        name: 'folder',
        type: String,
        defaultOption: true,
      },
    ];
  }

  async run(opts) {
    const { folder, key, version } = opts;

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    if (!folder) {
      return Promise.reject(new Error(`No folder provided. Usage \`${config.get('cli')} ${this.usage}\`.`));
    }

    // TODO: should we allow version selection at all here?
    // Let's revisit this once we re-evaluate our category logic in the API.
    // Ideally we should ignore this parameter entirely if the category is included.
    const selectedVersion = await getProjectVersion(version, key, false);

    debug(`selectedVersion: ${selectedVersion}`);

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

    debug(`number of files: ${files.length}`);

    if (!files.length) {
      return Promise.reject(new Error(`We were unable to locate Markdown files in ${folder}.`));
    }

    function createDoc(slug, file, hash, err) {
      if (err.error !== 'DOC_NOTFOUND') return Promise.reject(err);

      return fetch(`${config.get('host')}/api/v1/docs`, {
        method: 'post',
        headers: cleanHeaders(key, {
          'x-readme-version': selectedVersion,
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          slug,
          body: file.content,
          ...file.data,
          lastUpdatedHash: hash,
        }),
      }).then(res => handleRes(res));
    }

    function updateDoc(slug, file, hash, existingDoc) {
      if (hash === existingDoc.lastUpdatedHash) {
        return `\`${slug}\` was not updated because there were no changes.`;
      }

      return fetch(`${config.get('host')}/api/v1/docs/${slug}`, {
        method: 'put',
        headers: cleanHeaders(key, {
          'x-readme-version': selectedVersion,
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(
          Object.assign(existingDoc, {
            body: file.content,
            ...file.data,
            lastUpdatedHash: hash,
          })
        ),
      }).then(res => handleRes(res));
    }

    const updatedDocs = await Promise.all(
      files.map(async filename => {
        debug(`reading file ${filename}`);
        const file = await readFile(filename, 'utf8');
        const matter = frontMatter(file);
        debug(`frontmatter for ${filename}: ${JSON.stringify(matter)}`);

        // Stripping the subdirectories and markdown extension from the filename and lowercasing to get the default slug.
        const slug = matter.data.slug || path.basename(filename).replace(path.extname(filename), '').toLowerCase();
        const hash = crypto.createHash('sha1').update(file).digest('hex');

        debug(`fetching data for ${slug}`);

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
              return createDoc(slug, matter, hash, res);
            }
            debug(`data received for ${slug}, updating doc`);
            return updateDoc(slug, matter, hash, res);
          })
          .catch(err => {
            // eslint-disable-next-line no-param-reassign
            err.message = `Error uploading ${chalk.underline(filename)}:\n\n${err.message}`;
            throw err;
          });
      })
    );

    return updatedDocs;
  }
};
