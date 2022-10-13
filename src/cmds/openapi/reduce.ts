import type { CommandOptions } from '../../lib/baseCommand';

import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import jsonpath from 'jsonpath';
import oasReducer from 'oas/dist/lib/reducer';
import ora from 'ora';

import Command, { CommandCategories } from '../../lib/baseCommand';
import { checkFilePath } from '../../lib/checkFile';
import { oraOptions } from '../../lib/logger';
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
    this.position = 2;

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
    await super.run(opts);

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
          const tags = jsonpath
            .query(parsedBundledSpec, '$..paths..tags')
            .flat()
            .filter(tag => {
              // A spec may have a `name: tag` which this JSONPath query will pick up. Since that
              // definitely isn't a tag we want here we need to filter them out.
              return typeof tag === 'string';
            });

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
          return Object.keys(parsedBundledSpec.paths).map(p => ({
            title: p,
            value: p,
          }));
        },
      },
      {
        type: (prev, values) => (values.reduceBy === 'paths' ? 'multiselect' : null),
        name: 'methods',
        message: 'Choose which HTTP methods that are available across these paths to reduce by:',
        min: 1,
        choices: (prev, values) => {
          const paths: string[] = values.paths;
          let methods = paths
            .map((p: string) => Object.keys(parsedBundledSpec.paths[p]))
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
        name: 'outputPath',
        message: 'Enter the path to save your reduced API definition to:',
        initial: () => {
          const extension = path.extname(specPath);
          return `${path.basename(specPath).split(extension)[0]}-reduced${extension}`;
        },
        validate: value => checkFilePath(value),
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

    const spinner = ora({ ...oraOptions() });
    spinner.start('Reducing your API definition...');

    let reducedSpec;

    try {
      reducedSpec = oasReducer(parsedBundledSpec, {
        tags: promptResults.tags || [],
        paths: (promptResults.paths || []).reduce((acc: Record<string, string[]>, p: string) => {
          acc[p] = promptResults.methods;
          return acc;
        }, {}),
      });

      spinner.succeed(`${spinner.text} done! ✅`);
    } catch (err) {
      Command.debug(`reducer err: ${err.message}`);
      spinner.fail();
      throw err;
    }

    Command.debug(`saving reduced spec to ${promptResults.outputPath}`);

    fs.writeFileSync(promptResults.outputPath, JSON.stringify(reducedSpec, null, 2));

    Command.debug('reduced spec saved');

    return Promise.resolve(
      chalk.green(`Your reduced API definition has been saved to ${promptResults.outputPath}! 🤏`)
    );
  }
}
