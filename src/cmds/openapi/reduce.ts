import type { CommandOptions } from '../../lib/baseCommand';
import type { OASDocument } from 'oas/dist/rmoas.types';

import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import Oas from 'oas';
import oasReducer from 'oas/dist/lib/reducer';
import ora from 'ora';
import prompts from 'prompts';

import Command, { CommandCategories } from '../../lib/baseCommand';
import { oraOptions } from '../../lib/logger';
import prepareOas from '../../lib/prepareOas';
import promptTerminal from '../../lib/promptWrapper';
import { validateFilePath } from '../../lib/validatePromptInput';

interface Options {
  method?: string[];
  out?: string;
  path?: string[];
  spec?: string;
  tag?: string[];
  title?: string;
  workingDirectory?: string;
}

export default class OpenAPIReduceCommand extends Command {
  constructor() {
    super();

    this.command = 'openapi:reduce';
    this.usage = 'openapi:reduce [file|url] [options]';
    this.description = 'Reduce an OpenAPI definition into a smaller subset.';
    this.cmdCategory = CommandCategories.APIS;

    this.hiddenArgs = ['spec'];
    this.args = [
      {
        name: 'spec',
        type: String,
        defaultOption: true,
      },
      {
        name: 'tag',
        type: String,
        multiple: true,
        description: 'Tags to reduce by',
      },
      {
        name: 'path',
        type: String,
        multiple: true,
        description: 'Paths to reduce by',
      },
      {
        name: 'method',
        type: String,
        multiple: true,
        description: 'Methods to reduce by (can only be used alongside the `path` option)',
      },
      {
        name: 'out',
        type: String,
        description: 'Output file path to write reduced file to',
      },
      this.getTitleArg(),
      this.getWorkingDirArg(),
    ];
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    const { spec, title, workingDirectory } = opts;

    if (workingDirectory) {
      const previousWorkingDirectory = process.cwd();
      process.chdir(workingDirectory);
      Command.debug(`switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
    }

    const { preparedSpec, specPath, specType } = await prepareOas(spec, 'openapi:reduce', { title });
    const parsedPreparedSpec: OASDocument = JSON.parse(preparedSpec);

    if (specType !== 'OpenAPI') {
      throw new Error('Sorry, this reducer feature in rdme only supports OpenAPI 3.0+ definitions.');
    }

    if ((opts.path?.length || opts.method?.length) && opts.tag?.length) {
      throw new Error('You can pass in either tags or paths/methods, but not both.');
    }

    prompts.override({
      reduceBy: opts.tag?.length ? 'tags' : opts.path?.length ? 'paths' : undefined,
      tags: opts.tag,
      paths: opts.path,
      methods: opts.method,
      outputPath: opts.out,
    });

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
          const tags = new Oas(parsedPreparedSpec).getTags();

          return tags.map(tag => ({
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
          return Object.keys(parsedPreparedSpec.paths).map(p => ({
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
            .map((p: string) => Object.keys(parsedPreparedSpec.paths[p] || {}))
            .flat()
            .filter((method: string) => method.toLowerCase() !== 'parameters');

          // We have to catch this case so prompt doesn't crash
          if (!methods.length && !opts.method?.length) {
            throw new Error(
              'All paths in the API definition were removed. Did you supply the right path name to reduce by?',
            );
          }

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
          return `${path.basename(specPath).split(extension)[0]}.reduced${extension}`;
        },
        validate: value => validateFilePath(value),
      },
    ]);

    Command.debug(`reducing by ${promptResults.reduceBy}`);
    Command.debug(
      `options being supplied to the reducer: ${JSON.stringify({
        tags: promptResults.tags,
        paths: promptResults.paths,
        methods: promptResults.methods,
      })}`,
    );

    Command.debug(`about to reduce spec located at ${specPath}`);

    const spinner = ora({ ...oraOptions() });
    spinner.start('Reducing your API definition...');

    let reducedSpec;

    try {
      reducedSpec = oasReducer(parsedPreparedSpec, {
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
      chalk.green(`Your reduced API definition has been saved to ${promptResults.outputPath}! 🤏`),
    );
  }
}
