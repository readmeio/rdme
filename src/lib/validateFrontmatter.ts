import type DocsMigrateCommand from '../commands/docs/migrate.js';
import type DocsUploadCommand from '../commands/docs/upload.js';
import type { GuidesRequestRepresentation } from '../types.js';
import type { PageMetadata } from './readPage.js';

import ora from 'ora';

import { fix, writeFixes } from './frontmatter.js';
import isCI from './isCI.js';
import { oraOptions } from './logger.js';
import promptTerminal from './promptWrapper.js';
import { fetchMappings, fetchSchema } from './readmeAPIFetch.js';

export async function validateFrontmatter(
  this: DocsMigrateCommand | DocsUploadCommand,
  pages: PageMetadata[],
  promptQuestion: string,
  outputDir?: string,
): Promise<PageMetadata<GuidesRequestRepresentation>[]> {
  const { path: pathInput } = this.args;
  let pagesToReturn = pages;

  const validationSpinner = ora({ ...oraOptions() }).start('🔬 Validating frontmatter data...');

  const schema = await fetchSchema.call(this);
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

  if (filesWithIssues.length) {
    validationSpinner.warn(`${validationSpinner.text} issues found in ${filesWithIssues.length} file(s).`);
    if (filesWithFixableIssues.length) {
      if (isCI()) {
        throw new Error(
          `${filesWithIssues.length} file(s) have issues that should be fixed before uploading to ReadMe. Please run \`${this.config.bin} ${this.id} ${pathInput} --dry-run\` in a non-CI environment to fix them.`,
        );
      }

      const { confirm } = await promptTerminal([
        {
          type: 'confirm',
          name: 'confirm',
          message: `${filesWithFixableIssues.length} file(s) have issues that can be fixed automatically. ${promptQuestion}`,
        },
      ]);

      if (!confirm) {
        throw new Error('Aborting upload due to user input.');
      }

      const updatedFiles = pagesToReturn.map((file, index) => {
        return writeFixes.call(this, file, validationResults[index].updatedData, outputDir);
      });

      pagesToReturn = updatedFiles;
    }

    // also inform the user if there are files with issues that can't be fixed
    if (filesWithUnfixableIssues.length) {
      this.warn(
        `${filesWithUnfixableIssues.length} file(s) have issues that cannot be fixed automatically. The upload will proceed but we recommend addressing these issues. Please get in touch with us at support@readme.io if you need a hand.`,
      );
    }
  } else {
    validationSpinner.succeed(`${validationSpinner.text} no issues found!`);
  }

  return pagesToReturn;
}
