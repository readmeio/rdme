const chalk = require('chalk');
const config = require('config');
const changeCase = require('change-case');
const { getProjectVersion } = require('../../lib/versionSelect');
const fetch = require('../../lib/fetch');
const { cleanHeaders, handleRes } = require('../../lib/fetch');
const { debug } = require('../../lib/logger');

module.exports = class CategoriesCreateCommand {
  constructor() {
    this.command = 'categories:create';
    this.usage = 'categories:create <title> [options]';
    this.description = 'Create a category with the specified tile in your ReadMe project';
    this.category = 'categories';
    this.position = '2';

    this.hiddenargs = ['title'];
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
        name: 'title',
        type: String,
        defaultOption: true,
      },
      {
        name: 'categoryType',
        type: String,
        description: 'Category type, must be guide or reference',
      },
    ];
  }

  async run(opts) {
    const { categoryType, title, key, version } = opts;
    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    if (!title) {
      return Promise.reject(new Error(`No title provided. Usage \`${config.get('cli')} ${this.usage}\`.`));
    }

    if (categoryType !== 'guide' && categoryType !== 'reference' && !categoryType) {
      return Promise.reject(new Error('`categoryType` must be guide or reference.'));
    }

    const selectedVersion = await getProjectVersion(version, key, false);

    debug(`selectedVersion: ${selectedVersion}`);

    const slug = changeCase.paramCase(title);

    async function getNumberOfPages() {
      await fetch(`${config.get('host')}/api/v1/categories?perPage=10&page=1`, {
        method: 'get',
        headers: cleanHeaders(key, {
          'x-readme-version': selectedVersion,
          Accept: 'application/json',
        }),
      }).then(res => {
        return Math.ceil(res.headers.get('x-total-count') / 10);
      });
    }

    async function getAllCategories() {
      return [].concat(
        ...(await Promise.all(
          Array.from({ length: getNumberOfPages() }, (_, i) => i + 1).map(async page => {
            return fetch(`${config.get('host')}/api/v1/categories?perPage=10&page=${page}`, {
              method: 'get',
              headers: cleanHeaders(key, {
                'x-readme-version': selectedVersion,
                Accept: 'application/json',
              }),
            }).then(res => handleRes(res));
          })
        ))
      );
    }

    async function hasExistingCategory() {
      const existingCategories = getAllCategories().filter(category => {
        if (category.slug.match(`${slug}(-\\d)?`) && category.type === categoryType) {
          return true;
        }
        return false;
      });

      if (existingCategories.length > 0) {
        return true;
      }
      return false;
    }

    function createCategory() {
      if (hasExistingCategory() === true) {
        return `The ${slug} category of type ${categoryType} already exists for version ${version}, a new category was not created`;
      }
      return fetch(`${config.get('host')}/api/v1/categories`, {
        method: 'post',
        headers: cleanHeaders(key, {
          'x-readme-version': selectedVersion,
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          title,
          type: categoryType,
        }),
      })
        .then(postRes => handleRes(postRes))
        .then(postRes => `🌱 successfully created '${postRes.slug}' as a new category in version '${version}`);
    }

    const createdCategory = await createCategory();

    return chalk.green(createdCategory);
  }
};
