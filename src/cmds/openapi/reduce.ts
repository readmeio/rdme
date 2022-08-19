import type { CommandOptions } from '../../lib/baseCommand';

import fs from 'fs';

import chalk from 'chalk';
import jsonpath from 'jsonpath';
import oasReducer from 'oas/dist/lib/reducer';

import Command, { CommandCategories } from '../../lib/baseCommand';
import prepareOas from '../../lib/prepareOas';
import promptTerminal from '../../lib/promptWrapper';

export type Options = {
  spec?: string;
  workingDirectory?: string;
};

export default class OpenAPIReduceCommand extends Command {
  constructor() {
    super();

    this.command = 'openapi:reduce';
    this.usage = 'openapi:reduce [file] [options]';
    this.description = 'Reduce an OpenAPI definition into a smaller subset.';
    this.cmdCategory = CommandCategories.APIS;
    this.position = 3;

    this.hiddenArgs = ['spec'];
    this.args = [
      {
        name: 'spec',
        type: String,
        defaultOption: true,
      },
      {
        name: 'workingDirectory',
        type: String,
        description: 'Working directory (for usage with relative external references)',
      },
    ];
  }

  async run(opts: CommandOptions<Options>) {
    super.run(opts);

    const { spec, workingDirectory } = opts;

    if (workingDirectory) {
      process.chdir(workingDirectory);
    }

    const { bundledSpec, specPath, specType } = await prepareOas(spec, 'openapi:reduce');
    const parsedBundledSpec = JSON.parse(bundledSpec);

    if (specType !== 'OpenAPI') {
      throw new Error('Sorry, this reducer feature in rdme only supports OpenAPI 3.0+ definitions.');
    }

    const promptResults = await promptTerminal([
      {
        type: 'select',
        name: 'reduceBy',
        message: 'Would you like to reduce by paths or tags?',
        initial: 0,
        choices: [
          { title: 'Tags', value: 'tags' },
          { title: 'Paths', value: 'paths' },
        ],
      },
      {
        type: (prev, values) => (values.reduceBy === 'tags' ? 'multiselect' : null),
        name: 'tags',
        message: 'Choose which tags to reduce by:',
        min: 1,
        choices: () => {
          const tags = jsonpath.query(parsedBundledSpec, '$..paths..tags').flat();

          return [...new Set(tags)].map(tag => ({
            title: tag,
            value: tag,
          }));
        },
      },
      {
        type: (prev, values) => (values.reduceBy === 'paths' ? 'multiselect' : null),
        name: 'paths',
        message: 'Choose which paths to reduce by:',
        min: 1,
        choices: () => {
          return Object.keys(parsedBundledSpec.paths).map(path => ({
            title: path,
            value: path,
          }));
        },
      },
      {
        type: (prev, values) => (values.reduceBy === 'paths' ? 'multiselect' : null),
        name: 'methods',
        message: 'Choose which HTTP methods that are available across these paths to reduce by:',
        choices: (prev, values) => {
          const paths = values.paths;
          let methods = paths
            .map((path: string) => Object.keys(parsedBundledSpec.paths[path]))
            .flat()
            .filter((method: string) => method.toLowerCase() !== 'parameters');

          methods = [...new Set(methods)];
          methods.sort();

          return methods.map((method: string) => ({
            title: method.toUpperCase(),
            value: method,
          }));
        },
      },
      {
        type: 'text',
        name: 'ouputPath',
        message: 'Enter the path to save your reduced API definition to:',
        validate: value => {
          if (value.length) {
            if (!fs.existsSync(value)) {
              return true;
            }

            return 'Specified output path already exists.';
          }

          return 'An output path must be supplied.';
        },
      },
    ]);

    Command.debug(`reducing by ${promptResults.reduceBy}`);
    Command.debug(
      `options being supplied to the reducer: ${JSON.stringify({
        tags: promptResults.tags,
        paths: promptResults.tags,
        methods: promptResults.methods,
      })}`
    );

    Command.debug(`about to reduce spec located at ${specPath}`);

    const reducedSpec = oasReducer(parsedBundledSpec, {
      tags: promptResults.tags || [],
      paths: (promptResults.paths || []).reduce((acc: Record<string, string[]>, p: string) => {
        acc[p] = promptResults.methods;
        return acc;
      }, {}),
    });

    Command.debug(`saving reduced spec to ${promptResults.ouputPath}`);

    await fs.writeFileSync(promptResults.ouputPath, JSON.stringify(reducedSpec, null, 2));

    Command.debug('reduced spec saved');

    return Promise.resolve(chalk.green(`${specPath} has been reduced to ${promptResults.ouputPath}! 🤏`));
  }
}
