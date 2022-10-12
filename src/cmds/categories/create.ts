import type { CommandOptions } from '../../lib/baseCommand';

import chalk from 'chalk';
import config from 'config';
import { Headers } from 'node-fetch';

import Command, { CommandCategories } from '../../lib/baseCommand';
import fetch, { cleanHeaders, handleRes } from '../../lib/fetch';
import getCategories from '../../lib/getCategories';
import { getProjectVersion } from '../../lib/versionSelect';

interface Category {
  title: string;
  type: string;
}

export type Options = {
  categoryType?: 'guide' | 'reference';
  title?: string;
  preventDuplicates?: boolean;
};

export default class CategoriesCreateCommand extends Command {
  constructor() {
    super();

    this.command = 'categories:create';
    this.usage = 'categories:create <title> [options]';
    this.description = 'Create a category with the specified title and guide in your ReadMe project.';
    this.cmdCategory = CommandCategories.CATEGORIES;
    this.position = 2;

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

  async run(opts: CommandOptions<Options>) {
    super.run(opts);

    const { categoryType, title, key, version, preventDuplicates } = opts;

    if (!title) {
      return Promise.reject(new Error(`No title provided. Usage \`${config.get('cli')} ${this.usage}\`.`));
    }

    if (categoryType !== 'guide' && categoryType !== 'reference') {
      return Promise.reject(new Error('`categoryType` must be `guide` or `reference`.'));
    }

    const selectedVersion = await getProjectVersion(version, key);

    Command.debug(`selectedVersion: ${selectedVersion}`);

    async function matchCategory() {
      const allCategories = await getCategories(key, selectedVersion);

      return allCategories.find((category: Category) => {
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
        headers: cleanHeaders(
          key,
          new Headers({
            'x-readme-version': selectedVersion,
            'Content-Type': 'application/json',
          })
        ),
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
}
