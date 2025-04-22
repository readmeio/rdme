import type { PluginHooks } from '../../lib/hooks/exported.js';

import { Args, Flags, type Hook } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { dir } from 'tmp-promise';

import BaseCommand from '../../lib/baseCommand.js';
import { fix, writeFixes } from '../../lib/frontmatter.js';
import isCI from '../../lib/isCI.js';
import { oraOptions } from '../../lib/logger.js';
import promptTerminal from '../../lib/promptWrapper.js';
import { fetchMappings, fetchSchema } from '../../lib/readmeAPIFetch.js';
import { findPages } from '../../lib/readPage.js';
import { attemptUnzip } from '../../lib/unzip.js';

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
    'skip-validation': Flags.boolean({
      description:
        'Skips the validation of the Markdown files. Useful if this command is as part of a chain of commands that includes `docs upload`.',
    }),
  };

  async run() {
    const { path: rawPathInput }: { path: string } = this.args;
    const { out: rawOutputDir, 'skip-validation': skipValidation } = this.flags;

    const outputDir = rawOutputDir || (await dir({ prefix: 'rdme-migration-output' })).path;

    const zipResults = await attemptUnzip(rawPathInput);
    let { pathInput } = zipResults;

    // todo: fix this type once https://github.com/oclif/core/pull/1359 is merged
    const fileScanHookResults: Hook.Result<PluginHooks['pre_markdown_file_scan']['return']> = await this.config.runHook(
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

    let unsortedFiles = await findPages.call(this, pathInput);

    let transformedByHooks = false;

    // todo: fix this type once https://github.com/oclif/core/pull/1359 is merged
    const validationHookResults: Hook.Result<PluginHooks['pre_markdown_validation']['return']> =
      await this.config.runHook('pre_markdown_validation', { pages: unsortedFiles });

    if (!validationHookResults.successes.length && !validationHookResults.failures.length) {
      throw new Error('This command requires a valid migration plugin.');
    }

    validationHookResults.successes.forEach(success => {
      if (success.result && success.result.length) {
        transformedByHooks = true;
        this.log(`🔌 ${success.result.length} Markdown files updated via the \`${success.plugin.name}\` plugin`);
        unsortedFiles = success.result;
      }
    });

    validationHookResults.failures.forEach(fail => {
      if (fail.error && fail.error instanceof Error) {
        throw new Error(`Error executing the \`${fail.plugin.name}\` plugin: ${fail.error.message}`);
      }
    });

    // todo: either DRY this validation logic up or remove it entirely
    if (!skipValidation) {
      const validationSpinner = ora({ ...oraOptions() }).start('🔬 Validating frontmatter data...');

      const schema = await fetchSchema.call(this);
      const mappings = await fetchMappings.call(this);

      // validate the files, prompt user to fix if necessary
      const validationResults = unsortedFiles.map(file => {
        this.debug(`validating frontmatter for ${file.filePath}`);
        return fix.call(this, file.data, schema, mappings);
      });

      const filesWithIssues = validationResults.filter(result => result.hasIssues);
      const filesWithFixableIssues = filesWithIssues.filter(result => result.changeCount);
      const filesWithUnfixableIssues = filesWithIssues.filter(result => result.unfixableErrors.length);

      if (filesWithIssues.length) {
        validationSpinner.warn(`${validationSpinner.text} issues found in ${filesWithIssues.length} file(s).`);
        if (filesWithFixableIssues.length) {
          if (isCI()) {
            throw new Error(
              `${filesWithIssues.length} file(s) have issues. Please run \`${this.config.bin} ${this.id} ${pathInput} --dry-run\` in a non-CI environment to fix them.`,
            );
          }

          const { confirm } = await promptTerminal([
            {
              type: 'confirm',
              name: 'confirm',
              message: `${filesWithFixableIssues.length} file(s) have issues that can be fixed automatically. Would you like to make these changes?`,
            },
          ]);

          if (!confirm) {
            throw new Error('Aborting fixes due to user input.');
          }

          const fileUpdateSpinner = ora({ ...oraOptions() }).start(
            `📝 Writing file changes to the following directory: ${chalk.underline(outputDir)}...`,
          );

          const updatedFiles = unsortedFiles.map((file, index) => {
            return writeFixes.call(this, file, validationResults[index].updatedData, outputDir);
          });

          fileUpdateSpinner.succeed(`${fileUpdateSpinner.text} ${updatedFiles.length} file(s) updated!`);

          unsortedFiles = updatedFiles;
        }

        // also inform the user if there are files with issues that can't be fixed
        if (filesWithUnfixableIssues.length) {
          this.warn(
            `${filesWithUnfixableIssues.length} file(s) have issues that cannot be fixed automatically. Please get in touch with us at support@readme.io if you need a hand.`,
          );
        }
      } else if (transformedByHooks) {
        validationSpinner.succeed(`${validationSpinner.text} no issues found!`);

        const fileUpdateSpinner = ora({ ...oraOptions() }).start(
          `📝 Writing the updated files to the following directory: ${chalk.underline(outputDir)}...`,
        );

        const updatedFiles = unsortedFiles.map((file, index) => {
          return writeFixes.call(this, file, validationResults[index].updatedData, outputDir);
        });

        fileUpdateSpinner.succeed(`${fileUpdateSpinner.text} done!`);

        unsortedFiles = updatedFiles;
      } else {
        validationSpinner.succeed(`${validationSpinner.text} no issues found!`);
      }
    } else {
      this.debug('skipping validation');
      if (transformedByHooks) {
        const fileUpdateSpinner = ora({ ...oraOptions() }).start(
          `📝 Writing the updated files to the following directory: ${chalk.underline(outputDir)}...`,
        );

        const updatedFiles = unsortedFiles.map(file => {
          return writeFixes.call(this, file, file.data, outputDir);
        });

        fileUpdateSpinner.succeed(`${fileUpdateSpinner.text} done!`);

        unsortedFiles = updatedFiles;
      }
    }

    return { outputDir };
  }
}
