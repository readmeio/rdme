import type { PageMetadata } from './readPage.js';
import type { APIv2PageCommands } from '../index.js';
import type { PageRequestSchema, PageRoute } from './types/index.js';

import ora from 'ora';
import prompts from 'prompts';

import { fix, writeFixes } from './frontmatter.js';
import isCI from './isCI.js';
import { oraOptions } from './logger.js';
import promptTerminal from './promptWrapper.js';
import { fetchMappings, fetchSchema } from './readmeAPIFetch.js';

type ValidationStatus = 'autofixed-with-issues' | 'autofixed' | 'has-issues' | 'valid';

export async function validateFrontmatter(
  this: APIv2PageCommands,
  pages: PageMetadata[],
  outputDir?: string,
): Promise<{ pages: PageMetadata<PageRequestSchema<PageRoute>>[]; status: ValidationStatus }> {
  const { path: pathInput } = this.args;
  const { 'confirm-autofixes': confirmAutofixes } = this.flags;
  let pagesToReturn = pages;
  let status: ValidationStatus = 'valid';

  const validationSpinner = ora({ ...oraOptions() }).start('🔬 Validating frontmatter data...');

  const schema = fetchSchema.call(this);
  const mappings = await fetchMappings.call(this);

  // validate the files, prompt user to fix if necessary
  const validationResults = pages.map(file => {
    this.debug(`validating frontmatter for ${file.filePath}`);
    return fix.call(this, file.data, schema, mappings);
  });

  const filesWithIssues = validationResults.filter(result => result.hasIssues);
  this.debug(`found ${filesWithIssues.length} files with issues: ${JSON.stringify(filesWithIssues)}`);
  const filesWithFixableIssues = filesWithIssues.filter(result => result.fixableErrorCount);
  const filesWithUnfixableIssues = filesWithIssues.filter(result => result.unfixableErrors.length);

  if (!filesWithIssues.length) {
    validationSpinner.succeed(`${validationSpinner.text} no issues found!`);
  } else {
    status = 'has-issues';
    validationSpinner.warn(`${validationSpinner.text} issues found in ${filesWithIssues.length} file(s).`);
    if (filesWithFixableIssues.length) {
      if (confirmAutofixes) {
        this.log(`Automatically fixing issues in ${filesWithFixableIssues.length} file(s)...`);
        prompts.override({ confirm: true });
      } else if (isCI()) {
        throw new Error(
          `${filesWithIssues.length} file(s) have issues that should be fixed before uploading to ReadMe. Please run \`${this.config.bin} ${this.id} ${pathInput} --dry-run\` in a non-CI environment to fix them.`,
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
        throw new Error('Aborting upload due to user input.');
      }

      const updatedFiles = pagesToReturn.map((file, index) => {
        return writeFixes.call(this, file, validationResults[index].updatedData, outputDir);
      });

      pagesToReturn = updatedFiles;
      status = 'autofixed';
      this.log('✅ The following files have been automatically fixed:');
      pagesToReturn.forEach((file, index) => {
        const currentValidationResult = validationResults[index];
        if (currentValidationResult.fixableErrorCount) {
          this.log(
            `- ${file.filePath} (${currentValidationResult.fixableErrorCount} issue${currentValidationResult.fixableErrorCount > 1 ? 's' : ''})`,
          );
        }
      });

      this.log();
      this.log(
        'Please review the changes. Once everything looks good, run the command again to upload these files to ReadMe.',
      );
    }

    // also inform the user if there are files with issues that can't be fixed
    if (filesWithUnfixableIssues.length) {
      if (status !== 'autofixed') {
        this.warn(
          `${filesWithUnfixableIssues.length} file(s) have issues that cannot be fixed automatically. The upload will proceed but we recommend addressing these issues. Please get in touch with us at support@readme.io if you need a hand.`,
        );
      } else {
        status = 'autofixed-with-issues';
        this.warn(
          `${filesWithUnfixableIssues.length} file(s) have issues that cannot be fixed automatically. Autofixable issues have been addressed but we also recommend addressing these issues as well. Please get in touch with us at support@readme.io if you need a hand.`,
        );
      }
    }
  }

  return { pages: pagesToReturn, status };
}
