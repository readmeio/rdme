import type { CommandOptions } from '../../lib/baseCommand';

import chalk from 'chalk';
import ora from 'ora';
import pluralize from 'pluralize';
import { getBorderCharacters, table } from 'table';

import analyzeOas from '../../lib/analyzeOas';
import Command, { CommandCategories } from '../../lib/baseCommand';
import { oraOptions } from '../../lib/logger';
import prepareOas from '../../lib/prepareOas';

export type Options = {
  spec?: string;
  workingDirectory?: string;
};

export default class OpenAPIUsesCommand extends Command {
  constructor() {
    super();

    this.command = 'openapi:uses';
    this.usage = 'openapi:uses [file|url] [options]';
    this.description = 'Analyze an OpenAPI/Swagger definition for various OpenAPI and ReadMe feature usage.';
    this.cmdCategory = CommandCategories.APIS;
    this.position = 4;

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

    const { bundledSpec, definitionVersion } = await prepareOas(spec, 'openapi:uses', { convertToLatest: true });
    const parsedBundledSpec = JSON.parse(bundledSpec);

    const spinner = ora({ ...oraOptions() });
    spinner.start('Analyizing your API definition for OpenAPI and ReadMe feature usage...');

    const analysis = await analyzeOas(parsedBundledSpec).catch(err => {
      Command.debug(`reducer err: ${err.message}`);
      spinner.fail();
      throw err;
    });

    spinner.succeed(`${spinner.text} done! ✅`);

    const output: string[] = ['Here are some interesting things we found in your API defintion. 🕵️', ''];

    const tableBorder = Object.entries(getBorderCharacters('norc'))
      .map(([border, char]) => ({ [border]: chalk.gray(char) }))
      .reduce((prev, next) => Object.assign(prev, next));

    // General API definition statistics
    Object.entries(analysis.general).forEach(([, info]) => {
      let msg: string;

      if (Array.isArray(info.found)) {
        const highlightedData = info.found.map(d => chalk.yellow(d));

        if (info.found.length > 1) {
          msg = `You are using ${chalk.bold(info.found.length)} ${pluralize(
            info.name,
            info.found.length
          )} throughout your API: ${highlightedData.join(', ')}`;
        } else {
          msg = `You are using a single ${info.name} throughout your API: ${highlightedData[0]}`;
        }
      } else if (info.found > 1) {
        msg = `You have a total of ${chalk.bold(info.found)} ${pluralize(info.name, info.found)} in your API.`;
        if (info.found > 100) {
          msg += ' Wow!';
        }
      } else {
        msg = `You have a single ${info.name} in your API.`;
      }

      output.push(` · ${msg}`);
    });

    // Build out a view of all OpenAPI and ReadMe features that we discovered.
    [
      { component: 'openapi', header: 'OpenAPI Features' },
      { component: 'readme', header: 'ReadMe-specific Features and Extensions' },
    ].forEach(({ component, header }: { component: 'openapi' | 'readme'; header: string }) => {
      const tableData: string[][] = [
        [chalk.bold.green('Feature'), chalk.bold.green('Used?'), chalk.bold.green('Description')],
      ];

      Object.entries(analysis[component]).forEach(([feature, info]) => {
        const descriptions: string[] = [];
        if (info.description) {
          descriptions.push(info.description);
        }

        if (info.url) {
          if (typeof info.url === 'object') {
            // We don't need to do any Swagger or Postman determination here because this command
            // always converts their spec to OpenAPI 3.0.
            if (definitionVersion.version.startsWith('3.0')) {
              if (info.url?.['3.0']) {
                descriptions.push(chalk.grey(info.url['3.0']));
              }
            } else {
              descriptions.push(chalk.grey(info.url['3.1']));
            }
          } else {
            descriptions.push(chalk.grey(info.url));
          }
        }

        tableData.push([feature, info.present ? '✅' : '', descriptions.join('\n\n')]);
      });

      output.push('');
      output.push(header);
      output.push(
        table(tableData, {
          border: tableBorder,
          columns: {
            2: {
              width: 80,
              wrapWord: true,
            },
          },
        })
      );
    });

    return Promise.resolve(output.join('\n'));
  }
}
