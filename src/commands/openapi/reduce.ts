import type { OASDocument } from 'oas/types';

import fs from 'node:fs';
import path from 'node:path';

import { Flags } from '@oclif/core';
import chalk from 'chalk';
import Oas from 'oas';
import oasReducer from 'oas/reducer';
import ora from 'ora';
import prompts from 'prompts';

import BaseCommand from '../../lib/baseCommand.js';
import { specArg, titleFlag, workingDirectoryFlag } from '../../lib/flags.js';
import { oraOptions } from '../../lib/logger.js';
import prepareOas from '../../lib/prepareOas.js';
import promptTerminal from '../../lib/promptWrapper.js';
import { validateFilePath } from '../../lib/validatePromptInput.js';

export default class OpenAPIReduceCommand extends BaseCommand<typeof OpenAPIReduceCommand> {
  static summary = 'Reduce an OpenAPI definition into a smaller subset.';

  static description =
    "Reduce your API definition down to a specific set of tags or paths, which can be useful if you're debugging a problematic schema somewhere, or if you have a file that is too big to maintain.";

  static args = {
    spec: specArg,
  };

  static flags = {
    method: Flags.string({
      description: 'Methods to reduce by (can only be used alongside the `path` option)',
      multiple: true,
    }),
    out: Flags.string({ description: 'Output file path to write reduced file to' }),
    path: Flags.string({ description: 'Paths to reduce by', multiple: true }),
    tag: Flags.string({ description: 'Tags to reduce by', multiple: true }),
    title: titleFlag,
    workingDirectory: workingDirectoryFlag,
  };

  static examples = [
    {
      description:
        'By default, this command will ask you a couple questions about how you wish to reduce the file and then do so:',
      command: '<%= config.bin %> <%= command.id %> [url-or-local-path-to-file]',
    },
    {
      description:
        'You can omit the file name and `rdme` will scan your working directory (and any subdirectories) for OpenAPI/Swagger files. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.',
      command: '<%= config.bin %> <%= command.id %>',
    },
    {
      description: 'If you wish to automate this command, you can pass in CLI arguments to bypass the prompts:',
      command:
        '<%= config.bin %> <%= command.id %> petstore.json --path /pet/{id} --method get --method put --out petstore.reduced.json',
    },
  ];

  async run() {
    const { spec } = this.args;
    const opts = this.flags;
    const { title, workingDirectory } = opts;

    if (workingDirectory) {
      const previousWorkingDirectory = process.cwd();
      process.chdir(workingDirectory);
      this.debug(`switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
    }

    const { preparedSpec, specPath, specType } = await prepareOas(spec, 'openapi reduce', { title });
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
          return Object.keys(parsedPreparedSpec.paths || []).map(p => ({
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
            .flatMap((p: string) => Object.keys(parsedPreparedSpec.paths?.[p] || {}))
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

    this.debug(`reducing by ${promptResults.reduceBy}`);
    this.debug(
      `options being supplied to the reducer: ${JSON.stringify({
        tags: promptResults.tags,
        paths: promptResults.paths,
        methods: promptResults.methods,
      })}`,
    );

    this.debug(`about to reduce spec located at ${specPath}`);

    const spinner = ora({ ...oraOptions() });
    spinner.start('Reducing your API definition...');

    let reducedSpec: OASDocument;

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
      this.debug(`reducer err: ${err.message}`);
      spinner.fail();
      throw err;
    }

    this.debug(`saving reduced spec to ${promptResults.outputPath}`);

    fs.writeFileSync(promptResults.outputPath, JSON.stringify(reducedSpec, null, 2));

    this.debug('reduced spec saved');

    return Promise.resolve(
      chalk.green(`Your reduced API definition has been saved to ${promptResults.outputPath}! 🤏`),
    );
  }
}
