const config = require('config');
const { getProjectVersion } = require('../../lib/versionSelect');
const fetch = require('../../lib/fetch');
const { cleanHeaders, handleRes } = require('../../lib/fetch');
const { debug } = require('../../lib/logger');

module.exports = class CategoriesCommand {
  constructor() {
    this.command = 'categories';
    this.usage = 'categories [options]';
    this.description = 'Get all catefories in your ReadMe project';
    this.category = 'categories';
    this.position = 1;

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
    ];
  }

  async run(opts) {
    const { key, version } = opts;

    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }
    const selectedVersion = await getProjectVersion(version, key, true).catch(e => {
      return Promise.reject(e);
    });

    debug(`selectedVersion: ${selectedVersion}`);

    function getNumberOfPages() {
      return fetch(`${config.get('host')}/api/v1/categories?perPage=10&page=1`, {
        method: 'get',
        headers: cleanHeaders(key, {
          'x-readme-version': selectedVersion,
          Accept: 'application/json',
        }),
      }).then(res => {
        return Math.ceil(res.headers.get('x-total-count') / 10);
      });
    }

    const allCategories = [].concat(
      ...(await Promise.all(
        Array.from({ length: await getNumberOfPages() }, (_, i) => i + 1).map(async page => {
          return fetch(`${config.get('host')}/api/v1/categories?perPage=20&page=${page}`, {
            method: 'get',
            headers: cleanHeaders(key, {
              'x-readme-version': selectedVersion,
              Accept: 'application/json',
            }),
          }).then(res => handleRes(res));
        })
      ))
    );

    return JSON.stringify(allCategories, null, 2);
  }
};
