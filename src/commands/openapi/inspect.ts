import type { OASDocument } from 'oas/types';
import type { Analysis, AnalyzedFeature } from '../../lib/analyzeOas.js';

import { Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { getBorderCharacters, table } from 'table';

import analyzeOas, { getSupportedFeatures } from '../../lib/analyzeOas.js';
import BaseCommand from '../../lib/baseCommand.js';
import { specArg, workingDirectoryFlag } from '../../lib/flags.js';
import { oraOptions } from '../../lib/logger.js';
import prepareOas from '../../lib/prepareOas.js';
import SoftError from '../../lib/softError.js';

function pluralize(str: string, count: number) {
  return count > 1 ? `${str}s` : str;
}

function getFeatureDocsURL(feature: AnalyzedFeature, definitionVersion: string): string | undefined {
  if (!feature.url) {
    return undefined;
  }

  if (typeof feature.url === 'object') {
    // We don't need to do any Swagger or Postman determination here because this command
    // always converts their spec to OpenAPI 3.0.
    if (definitionVersion.startsWith('3.0')) {
      return feature.url?.['3.0'] || 'This feature is not available on OpenAPI v3.0.';
    } else if (definitionVersion.startsWith('3.1')) {
      return feature.url?.['3.1'] || 'This feature is not available on OpenAPI v3.1.';
    }
    return '';
  }

  return feature.url;
}

function buildFeaturesReport(analysis: Analysis, features: string[]) {
  let hasUnusedFeature = false;
  const report: string[] = [
    // Minor bit of padding between the top of our report and the "analyzing your spec" messaging.
    '',
  ];

  features.forEach(feature => {
    if (feature in analysis.openapi) {
      const info = analysis.openapi[feature as keyof Analysis['openapi']];
      if (!info.present) {
        // If our last report entry was an unused feature we should add an empty line in the
        // report to give everything some room to breathe.
        if (report.length && report[report.length - 1].length) {
          report.push('');
        }

        report.push(`${feature}: You do not use this.`);
        hasUnusedFeature = true;
      } else {
        report.push('');
        report.push(`${feature}:`);
        report.push(...(info.locations as string[]).map(loc => ` · ${chalk.yellow(loc)}`));
      }
    }
  });

  if (features.includes('readme')) {
    // Add some spacing between our OpenAPI and ReadMe extension reports (but only if our last
    // entry wasn't an empty line).
    if (features.length > 1 && report[report.length - 1].length) {
      report.push('');
    }

    Object.entries(analysis.readme).forEach(([feature, info]) => {
      if (info.hidden) {
        return;
      }

      if (!info.present) {
        report.push(`${feature}: You do not use this.`);
        hasUnusedFeature = true;
      } else {
        report.push(`${feature}:`);
        report.push(...(info.locations as string[]).map(loc => ` · ${chalk.yellow(loc)}`));
        report.push('');
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

  return {
    report: report.join('\n'),
    hasUnusedFeature,
  };
}

function buildFullReport(analysis: Analysis, definitionVersion: string, tableBorder: Record<string, string>) {
  const report: string[] = ['Here are some interesting things we found in your API definition. 🕵️', ''];

  const allowedKeys = ['dereferencedFileSize', 'mediaTypes', 'operationTotal', 'rawFileSize', 'securityTypes'];
  const sizeKeys = ['rawFileSize', 'dereferencedFileSize'];

  // General API definition statistics
  report.push(
    ...(Object.entries(analysis.general || {})
      .filter(([key]) => allowedKeys.includes(key))
      .map(([key, info]) => {
        if (Array.isArray(info.found)) {
          if (!info.found.length) return false;

          const highlightedData = info.found.map(d => chalk.yellow(d));
          if (info.found.length > 1) {
            const pluralName = pluralize(info.name.toLowerCase(), info.found.length);
            return `You are using ${chalk.bold(info.found.length)} ${pluralName} throughout your API: ${new Intl.ListFormat('en').format(highlightedData)}`;
          }

          return `You are using a single ${info.name.toLowerCase()} throughout your API: ${highlightedData[0]}`;
        }

        if (info.found === 0) return false;

        const isSizeKey = sizeKeys.includes(key);
        const isPlural = info.found > 1;

        let baseMessage = isSizeKey
          ? `Your ${info.name.toLowerCase()} is ${chalk.bold(info.found)} MB.`
          : isPlural
            ? `You have a total of ${chalk.bold(info.found)} ${pluralize(info.name.toLowerCase(), info.found)} in your API.`
            : `You have a single ${info.name.toLowerCase()} in your API.`;

        const wowThreshold = isSizeKey ? 10 : 200;
        if (info.found > wowThreshold) {
          baseMessage += ` ${chalk.cyanBright('Wow! 🤯')}`;
        }

        return baseMessage;
      })
      .filter(Boolean)
      .map(msg => ` · ${msg}`) as string[]),
  );

  report.push(''); // Extra bit of space between our general API information and feature tables.

  // Build out a view of all OpenAPI and ReadMe features that we discovered.
  [
    { component: 'openapi', header: 'OpenAPI Features', emoji: '🌲' },
    { component: 'readme', header: 'ReadMe-Specific Features and Extensions', emoji: '🦉' },
  ].forEach(({ component, header, emoji }) => {
    const tableData: string[][] = [
      [chalk.bold.yellow('Feature'), chalk.bold.yellow('Used?'), chalk.bold.yellow('Description')],
      ...(Object.entries(analysis[component as 'openapi' | 'readme'])
        .map(([feature, info]) => {
          if (info.hidden) return false;

          const descriptions: string[] = [];
          if (info.description) {
            descriptions.push(info.description);
          }

          const url = getFeatureDocsURL(info, definitionVersion);
          if (url) {
            descriptions.push(chalk.dim(url));
          }

          return [feature, info.present ? '🟢' : '🔴', descriptions.join('\n\n')];
        })
        .filter(Boolean) as string[][]),
    ];

    report.push(`${emoji} ${header}`);
    report.push(
      table(tableData, {
        border: tableBorder,
        columns: {
          0: {
            width: 26,
          },
          2: {
            width: 80,
            wrapWord: true,
          },
        },
      }),
    );
  });

  return report.join('\n');
}

export default class OpenAPIInspectCommand extends BaseCommand<typeof OpenAPIInspectCommand> {
  id = 'openapi inspect' as const;

  static summary = 'Analyze an OpenAPI/Swagger definition for various OpenAPI and ReadMe feature usage.';

  static description =
    "This command will perform a comprehensive analysis of your API definition to determine how it's utilizing aspects of the OpenAPI Specification (such as circular references, polymorphism, etc.) and any ReadMe-specific extensions you might be using.";

  static args = {
    spec: specArg,
  };

  static flags = {
    feature: Flags.string({
      description:
        'A specific OpenAPI or ReadMe feature you wish to see detailed information on (if it exists). If any features supplied do not exist within the API definition an exit(1) code will be returned alongside the report.',
      multiple: true,
      options: getSupportedFeatures(),
    }),
    workingDirectory: workingDirectoryFlag,
  };

  static examples = [
    {
      description:
        'By default, this command will display a comprehensive table of all OpenAPI and ReadMe features found in your API definition:',
      command: '<%= config.bin %> <%= command.id %> [url-or-local-path-to-file]',
    },
    {
      description:
        'You can omit the file name and `rdme` will scan your working directory (and any subdirectories) for OpenAPI/Swagger files. This approach will provide you with CLI prompts, so we do not recommend this technique in CI environments.',
      command: '<%= config.bin %> <%= command.id %>',
    },
    {
      description:
        'If you wish to automate this command, it contains a `--feature` flag so you can filter for one or several specific features. If you pass in one or more `--feature` flags, the command returns a `0` exit code if your definition contains all of the given features and a `1` exit code if your definition lacks any of the given features:',
      command:
        '<%= config.bin %> <%= command.id %> [url-or-local-path-to-file] --feature circularRefs --feature polymorphism',
    },
  ];

  async run() {
    const { workingDirectory, feature: features } = this.flags;

    const tableBorder = Object.entries(getBorderCharacters('norc'))
      .map(([border, char]) => ({ [border]: chalk.gray(char) }))
      // biome-ignore lint/performance/noAccumulatingSpread: @todo can this be improved?
      .reduce((prev, next) => Object.assign(prev, next));

    if (workingDirectory) {
      const previousWorkingDirectory = process.cwd();
      process.chdir(workingDirectory);
      this.debug(`switching working directory from ${previousWorkingDirectory} to ${process.cwd()}`);
    }

    const { preparedSpec, definitionVersion } = await prepareOas.call(this);
    const parsedPreparedSpec: OASDocument = JSON.parse(preparedSpec);

    const spinner = ora({ ...oraOptions() });
    if (features?.length) {
      spinner.start(
        `Analyzing your API definition for usage of ${new Intl.ListFormat('en').format(
          features.map(feature => (feature === 'readme' ? 'ReadMe extensions' : feature)),
        )}...`,
      );
    } else {
      spinner.start('Analyzing your API definition for OpenAPI and ReadMe feature usage...');
    }

    const analysis = await analyzeOas(parsedPreparedSpec).catch(err => {
      this.debug(`analyzer err: ${err.message}`);
      spinner.fail();
      throw err;
    });

    if (features?.length) {
      spinner.succeed(`${spinner.text} done! ✅`);
      const { report, hasUnusedFeature } = buildFeaturesReport(analysis, features);
      if (hasUnusedFeature) {
        // If we have any unused features we should reject the command with a soft error so we
        // output the report as normal but return a `exit(1)` status code.
        return Promise.reject(new SoftError(report));
      }

      return Promise.resolve(report);
    }

    spinner.stop();

    return Promise.resolve(buildFullReport(analysis, definitionVersion.version, tableBorder));
  }
}
