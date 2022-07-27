const chalk = require('chalk');
const { cleanHeaders, handleRes } = require('../../lib/fetch');
const config = require('config');
const { debug } = require('../../lib/logger');
const fetch = require('../../lib/fetch');
const getCategories = require('../../lib/getCategories');
const { getProjectVersion } = require('../../lib/versionSelect');

module.exports = class CategoriesCreateCommand {
  constructor() {
    this.command = 'categories:create';
    this.usage = 'categories:create <title> [options]';
    this.description = 'Create a category with the specified title and guide in your ReadMe project';
    this.cmdCategory = 'categories';
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
          'Prevents the creation of a new category if their is an existing category with a matching `categoryType` and `title`',
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

    async function matchCategory() {
      const allCategories = await getCategories(key, selectedVersion);

      return allCategories.find(category => {
        return category.title.trim().toLowerCase() === title.trim().toLowerCase() && category.type === categoryType;
      });
    }

    async function createCategory() {
      if (preventDuplicates) {
        const matchedCategory = await matchCategory();
        if (typeof matchedCategory !== 'undefined') {
          return Promise.reject(
            new Error(
              `The '${matchedCategory.title}' category with a type of '${matchedCategory.type}' already exists with an id of '${matchedCategory.id}'. A new category was not created.`
            )
          );
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
