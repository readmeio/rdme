import type { Analysis, AnalyzedFeature } from '../../lib/analyzeOas';
import type { CommandOptions } from '../../lib/baseCommand';

import chalk from 'chalk';
import config from 'config';
import ora from 'ora';
import pluralize from 'pluralize';
import { getBorderCharacters, table } from 'table';

import analyzeOas, { getSupportedFeatures } from '../../lib/analyzeOas';
import Command, { CommandCategories } from '../../lib/baseCommand';
import { oraOptions } from '../../lib/logger';
import prepareOas from '../../lib/prepareOas';

export type Options = {
  spec?: string;
  workingDirectory?: string;
  feature?: string[];
};

export default class OpenAPIUsesCommand extends Command {
  definitionVersion: string;

  tableBorder: Record<string, string>;

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
      {
        name: 'feature',
        type: String,
        description: `A specific OpenAPI or ReadMe feature you wish to see detailed information on (if it exists). Available options: ${new Intl.ListFormat(
          'en',
          { style: 'narrow' }
        ).format(getSupportedFeatures())}`,
        multiple: true,
      },
    ];

    this.tableBorder = Object.entries(getBorderCharacters('norc'))
      .map(([border, char]) => ({ [border]: chalk.gray(char) }))
      .reduce((prev, next) => Object.assign(prev, next));
  }

  getFeatureDocsURL(feature: AnalyzedFeature) {
    if (!feature.url) {
      return undefined;
    }

    if (typeof feature.url === 'object') {
      // We don't need to do any Swagger or Postman determination here because this command
      // always converts their spec to OpenAPI 3.0.
      if (this.definitionVersion.startsWith('3.0')) {
        if (feature.url?.['3.0']) {
          return feature.url['3.0'];
        }
      } else {
        return feature.url['3.1'];
      }
    }

    return feature.url;
  }

  // eslint-disable-next-line class-methods-use-this
  buildFeaturesReport(analysis: Analysis, features: string[]) {
    const report: string[] = [''];

    features.forEach(feature => {
      if (feature in analysis.openapi) {
        const info = analysis.openapi[feature as keyof Analysis['openapi']];
        if (!info.present) {
          report.push(`${feature}: You do not use this.`);
        } else {
          report.push('');
          report.push(`${feature}:`);
          report.push(...(info.locations as string[]).map(loc => ` · ${chalk.yellow(loc)}`));
          report.push('');
        }
      }
    });

    if (features.includes('readme')) {
      Object.entries(analysis.readme).forEach(([feature, info]) => {
        if (!info.present) {
          report.push(`${feature}: You do not use this.`);
        } else {
          report.push('');
          report.push(`${feature}:`);
          report.push(...(info.locations as string[]).map(loc => ` · ${chalk.yellow(loc)}`));
        }
      });
    }

    // Because we add a little bit of padding between our report and the "analyzing your spec" copy
    // if this second entry in the report is an empty line then we can safely remove it so we don't
    // end up with multiple empty lines at the top of our report.
    if (!report[1].length) {
      report.splice(0, 1);
    }

    // If the last entry in our report array is an empty string then we should remove it.
    if (!report[report.length - 1].length) {
      report.pop();
    }

    return report.join('\n');
  }

  buildFullReport(analysis: Analysis) {
    const report: string[] = ['Here are some interesting things we found in your API defintion. 🕵️', ''];

    // General API definition statistics
    Object.entries(analysis.general).forEach(([, info]) => {
      let msg: string;

      if (Array.isArray(info.found)) {
        const highlightedData = info.found.map(d => chalk.yellow(d));

        if (info.found.length > 1) {
          msg = `You are using ${chalk.bold(info.found.length)} ${pluralize(
            info.name,
            info.found.length
          )} throughout your API: ${new Intl.ListFormat('en').format(highlightedData)}`;
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

      report.push(` · ${msg}`);
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

        const url = this.getFeatureDocsURL(info);
        if (url) {
          descriptions.push(chalk.grey(url));
        }

        tableData.push([feature, info.present ? '✅' : '', descriptions.join('\n\n')]);
      });

      report.push('');
      report.push(header);
      report.push(
        table(tableData, {
          border: this.tableBorder,
          columns: {
            2: {
              width: 80,
              wrapWord: true,
            },
          },
        })
      );
    });

    return report.join('\n');
  }

  async run(opts: CommandOptions<Options>) {
    await super.run(opts);

    const { spec, workingDirectory, feature: features } = opts;

    // If we have features we should validate that they're supported.
    if (features) {
      const invalidFeatures = features.filter(feature => !getSupportedFeatures().includes(feature));
      if (invalidFeatures.length) {
        return Promise.reject(
          new Error(
            `Unknown features: ${invalidFeatures.join(', ')}. See \`${config.get('cli')} help ${
              this.command
            }\` for help.`
          )
        );
      }
    }

    if (workingDirectory) {
      process.chdir(workingDirectory);
    }

    const { bundledSpec, definitionVersion } = await prepareOas(spec, 'openapi:uses', { convertToLatest: true });
    this.definitionVersion = definitionVersion.version;
    const parsedBundledSpec = JSON.parse(bundledSpec);

    const spinner = ora({ ...oraOptions() });
    if (features) {
      spinner.start(
        `Analyzing your API definition for usage of ${new Intl.ListFormat('en').format(
          features.map(feature => (feature === 'readme' ? 'ReadMe extensions' : feature))
        )}...`
      );
    } else {
      spinner.start('Analyzing your API definition for OpenAPI and ReadMe feature usage...');
    }

    const analysis = await analyzeOas(parsedBundledSpec).catch(err => {
      Command.debug(`analyzer err: ${err.message}`);
      spinner.fail();
      throw err;
    });

    spinner.succeed(`${spinner.text} done! ✅`);

    if (features) {
      return Promise.resolve(this.buildFeaturesReport(analysis, features));
    }

    return Promise.resolve(this.buildFullReport(analysis));
  }
}
