import type { MigrationStats, PluginHooks } from '../../lib/hooks/exported.js';

import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { dir } from 'tmp-promise';

import BaseCommand from '../../lib/baseCommand.js';
import { writeFixes } from '../../lib/frontmatter.js';
import { oraOptions } from '../../lib/logger.js';
import { baseFlags } from '../../lib/pageCommandProperties.js';
import { findPages } from '../../lib/readPage.js';
import { attemptUnzip } from '../../lib/unzip.js';
import { validateFrontmatter } from '../../lib/validateFrontmatter.js';

const alphaNotice = 'This command is in an experimental alpha and is likely to change. Use at your own risk!';

export default class DocsMigrateCommand extends BaseCommand<typeof DocsMigrateCommand> {
  id = 'docs migrate' as const;

  route = 'guides' as const;

  static hidden = true;

  static summary = `Migrates a directory of pages to the ReadMe Guides format.\n\n${alphaNotice}`;

  static description =
    "The path can either be a directory or a single Markdown file. The command will transform the Markdown using plugins and validate the frontmatter to conform to ReadMe's standards.";

  static args = {
    path: Args.string({ description: 'Path to a local Markdown file or folder of Markdown files.', required: true }),
  };

  static flags = {
    out: Flags.string({
      summary: 'The directory to write the migration output to. Defaults to a temporary directory.',
    }),
    // NOTE: the `baseFlags` function contains a handful of properties (e.g., `dry-run`, `max-errors`)
    // that aren't actually used in this command, but are included for consistency/simplicity
    // since this command is purely for internal use.
    ...baseFlags('Guides'),
    'hide-experimental-warning': Flags.boolean({
      description: 'Hides the warning message about this command being in an experimental alpha.',
      hidden: true,
    }),
  };

  async run(): Promise<{ outputDir: string; stats: MigrationStats }> {
    if (!this.flags['hide-experimental-warning']) {
      this.warn(alphaNotice);
    }
    const { path: rawPathInput }: { path: string } = this.args;
    const { out: rawOutputDir, 'skip-validation': skipValidation } = this.flags;

    const outputDir = rawOutputDir || (await dir({ prefix: 'rdme-migration-output' })).path;

    const zipResults = await attemptUnzip(rawPathInput);
    let { pathInput } = zipResults;

    const fileScanHookResults = await this.config.runHook<'pre_markdown_file_scan', PluginHooks>(
      'pre_markdown_file_scan',
      zipResults,
    );

    fileScanHookResults.successes.forEach(success => {
      if (success.result) {
        pathInput = success.result;
      }
    });

    fileScanHookResults.failures.forEach(fail => {
      if (fail.error && fail.error instanceof Error) {
        throw new Error(`Error executing the \`${fail.plugin.name}\` plugin: ${fail.error.message}`);
      }
    });

    const stats: MigrationStats = {
      migrationOutputDir: outputDir,
      results: {},
      timestamp: new Date().toISOString(),
    };

    if (zipResults.zipped) {
      stats.unzippedAssetsDir = zipResults.unzippedDir;
    }

    let unsortedFiles = await findPages.call(this, pathInput);

    let transformedByHooks = false;

    const validationHookResults = await this.config.runHook<'pre_markdown_validation', PluginHooks>(
      'pre_markdown_validation',
      { pages: unsortedFiles },
    );

    if (!validationHookResults.successes.length && !validationHookResults.failures.length) {
      throw new Error('This command requires a valid migration plugin.');
    }

    validationHookResults.successes.forEach(success => {
      if (success.result?.pages.length) {
        transformedByHooks = true;
        this.log(`🔌 ${success.result.pages.length} Markdown files updated via the \`${success.plugin.name}\` plugin`);
        stats.results[success.plugin.name] = success.result.stats;
        unsortedFiles = success.result.pages;
      }
    });

    validationHookResults.failures.forEach(fail => {
      if (fail.error && fail.error instanceof Error) {
        throw new Error(`Error executing the \`${fail.plugin.name}\` plugin: ${fail.error.message}`);
      }
    });

    if (skipValidation) {
      this.debug('skipping validation');
    } else {
      unsortedFiles = (await validateFrontmatter.call(this, unsortedFiles, outputDir)).pages;
    }

    if (transformedByHooks) {
      const fileUpdateSpinner = ora({ ...oraOptions() }).start(
        `📝 Writing the updated files to the following directory: ${chalk.underline(outputDir)}...`,
      );

      const updatedFiles = unsortedFiles.map(file => {
        // TODO: I think that this `writeFixes` call is redundant if `validateFrontmatter` above also writes to the file,
        // but it's not even close to being a bottleneck so I'm not going to worry about it for now
        return writeFixes.call(this, file, file.data, outputDir);
      });

      fileUpdateSpinner.succeed(`${fileUpdateSpinner.text} done!`);

      unsortedFiles = updatedFiles;
    }

    return { outputDir, stats };
  }
}
