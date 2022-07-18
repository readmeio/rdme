const chalk = require('chalk');
const config = require('config');
const { getProjectVersion } = require('../../lib/versionSelect');
const fetch = require('../../lib/fetch');
const { cleanHeaders, handleRes } = require('../../lib/fetch');
const { debug } = require('../../lib/logger');

module.exports = class CategoriesCreateCommand {
  constructor() {
    this.command = 'categories:create';
    this.usage = 'categories:create <title> [options]';
    this.description = 'Create a category with the specified title and guide in your ReadMe project';
    this.category = 'categories';
    this.position = 2;

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
        description: 'Category type, must be `guide` or `reference`',
      },
      {
        name: 'preventDuplicates',
        type: Boolean,
        description:
          'Prevents the creation of a new category if their is an existing category with a mathcing `categoryType` and exact matching `title`',
      },
    ];
  }

  async run(opts) {
    const { categoryType, title, key, version, preventDuplicates } = opts;
    debug(`command: ${this.command}`);
    debug(`opts: ${JSON.stringify(opts)}`);

    if (!key) {
      return Promise.reject(new Error('No project API key provided. Please use `--key`.'));
    }

    if (!title) {
      return Promise.reject(new Error(`No title provided. Usage \`${config.get('cli')} ${this.usage}\`.`));
    }

    if (categoryType !== 'guide' && categoryType !== 'reference') {
      return Promise.reject(new Error('`categoryType` must be `guide` or `reference`.'));
    }

    const selectedVersion = await getProjectVersion(version, key, false);

    debug(`selectedVersion: ${selectedVersion}`);

    function getNumberOfPages() {
      return fetch(`${config.get('host')}/api/v1/categories?perPage=20&page=1`, {
        method: 'get',
        headers: cleanHeaders(key, {
          'x-readme-version': selectedVersion,
          Accept: 'application/json',
        }),
      }).then(res => {
        return Math.ceil(res.headers.get('x-total-count') / 20);
      });
    }

    async function matchCategory() {
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

      return allCategories.filter(category => {
        return category.title.trim().toLowerCase() === title.trim().toLowerCase() && category.type === categoryType;
      });
    }

    async function createCategory() {
      if (preventDuplicates) {
        const matchedCategory = await matchCategory();
        if (matchedCategory.length > 0) {
          return `The '${matchedCategory[0].title}' category with a type of '${matchedCategory[0].type}' already exists with an id of '${matchedCategory[0].id}'. A new category was not created`;
        }
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
        .then(res => handleRes(res))
        .then(res => `🌱 successfully created '${res.title}' with a type of '${res.type}' and an id of '${res.id}'`);
    }

    const createdCategory = chalk.green(await createCategory());

    return Promise.resolve(createdCategory);
  }
};
