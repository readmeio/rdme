import type { AuthenticatedCommandOptions } from '../../lib/baseCommand.js';

import chalk from 'chalk';

import Command, { CommandCategories } from '../../lib/baseCommand.js';
import config from '../../lib/config.js';
import getCategories from '../../lib/getCategories.js';
import readmeAPIFetch, { cleanHeaders, handleRes } from '../../lib/readmeAPIFetch.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

interface Category {
  title: string;
  type: string;
}

interface Options {
  categoryType?: 'guide' | 'reference';
  preventDuplicates?: boolean;
  title?: string;
}

export default class CategoriesCreateCommand extends Command {
  constructor() {
    super();

    this.command = 'categories:create';
    this.usage = 'categories:create <title> [options]';
    this.description = 'Create a category with the specified title and guide in your ReadMe project.';
    this.cmdCategory = CommandCategories.CATEGORIES;

    this.hiddenArgs = ['title'];
    this.args = [
      this.getKeyArg(),
      this.getVersionArg(),
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
          'Prevents the creation of a new category if there is an existing category with a matching `categoryType` and `title`',
      },
    ];
  }

  async run(opts: AuthenticatedCommandOptions<Options>) {
    await super.run(opts);

    const { categoryType, title, key, version, preventDuplicates } = opts;

    if (!title) {
      return Promise.reject(new Error(`No title provided. Usage \`${config.cli} ${this.usage}\`.`));
    }

    if (categoryType !== 'guide' && categoryType !== 'reference') {
      return Promise.reject(new Error('`categoryType` must be `guide` or `reference`.'));
    }

    const selectedVersion = await getProjectVersion(version, key);

    Command.debug(`selectedVersion: ${selectedVersion}`);

    if (preventDuplicates) {
      const allCategories = await getCategories(key, selectedVersion);

      const matchedCategory = allCategories.find((category: Category) => {
        return category.title.trim().toLowerCase() === title.trim().toLowerCase() && category.type === categoryType;
      });

      if (typeof matchedCategory !== 'undefined') {
        return Promise.reject(
          new Error(
            `The '${matchedCategory.title}' category with a type of '${matchedCategory.type}' already exists with an id of '${matchedCategory.id}'. A new category was not created.`,
          ),
        );
      }
    }

    const createdCategory = await readmeAPIFetch('/api/v1/categories', {
      method: 'post',
      headers: cleanHeaders(key, selectedVersion, new Headers({ 'Content-Type': 'application/json' })),
      body: JSON.stringify({
        title,
        type: categoryType,
      }),
    })
      .then(handleRes)
      .then(res => `🌱 successfully created '${res.title}' with a type of '${res.type}' and an id of '${res.id}'`);

    return Promise.resolve(chalk.green(createdCategory));
  }
}
