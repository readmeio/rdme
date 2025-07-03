import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';

import BaseCommand from '../../lib/baseCommand.js';
import { keyFlag, versionFlag } from '../../lib/flags.js';
import getCategories from '../../lib/getCategories.js';
import { cleanAPIv1Headers, handleAPIv1Res, readmeAPIv1Fetch } from '../../lib/readmeAPIFetch.js';
import { getProjectVersion } from '../../lib/versionSelect.js';

interface Category {
  title: string;
  type: string;
}

export default class CategoriesCreateCommand extends BaseCommand<typeof CategoriesCreateCommand> {
  // needed for deprecation message
  static id = 'categories create' as const;

  static state = 'deprecated';

  static deprecationOptions = {
    message: `\`rdme ${this.id}\` is deprecated and will be removed in v10.\n\nFor more information, please visit our migration guide: https://github.com/readmeio/rdme/blob/v10/documentation/migration-guide.md#migrating-to-rdme9`,
  };

  static description = 'Create a category with the specified title and guide in your ReadMe project.';

  static args = {
    title: Args.string({ description: 'Title of the category', required: true }),
  };

  static flags = {
    categoryType: Flags.option({
      description: 'Category type',
      options: ['guide', 'reference'] as const,
      required: true,
    })(),
    key: keyFlag,
    preventDuplicates: Flags.boolean({
      description:
        'Prevents the creation of a new category if there is an existing category with a matching `categoryType` and `title`',
    }),
    version: versionFlag,
  };

  static examples = [
    {
      description: 'Create a new category for your project version:',
      command:
        '<%= config.bin %> <%= command.id %> <title> --categoryType={guide|reference} --version={project-version}',
    },
    {
      description:
        'If you want to prevent the creation of a duplicate category with a matching `title` and `categoryType`, supply the `--preventDuplicates` flag:',
      command:
        '<%= config.bin %> <%= command.id %> <title> --categoryType={guide|reference} --version={project-version} --preventDuplicates',
    },
  ];

  async run() {
    const { title } = this.args;
    const { categoryType, key, version, preventDuplicates } = this.flags;

    const selectedVersion = await getProjectVersion(version, key);

    this.debug(`selectedVersion: ${selectedVersion}`);

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

    const createdCategory = await readmeAPIv1Fetch('/api/v1/categories', {
      method: 'post',
      headers: cleanAPIv1Headers(key, selectedVersion, new Headers({ 'Content-Type': 'application/json' })),
      body: JSON.stringify({
        title,
        type: categoryType,
      }),
    })
      .then(handleAPIv1Res)
      .then(res => `🌱 successfully created '${res.title}' with a type of '${res.type}' and an id of '${res.id}'`);

    return Promise.resolve(chalk.green(createdCategory));
  }
}
