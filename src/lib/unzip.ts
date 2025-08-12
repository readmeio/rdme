import type { MarkdownFileScanResultOpts } from '../types.js';

import path from 'node:path';

import chalk from 'chalk';
import ora from 'ora';
import { dir } from 'tmp-promise';
import { Open } from 'unzipper';

import { oraOptions } from './logger.js';

/**
 * If the input is a zip file, unzip it and return the new path.
 * If the input is not a zip file, pass through the original path.
 */
export async function attemptUnzip(pathInput: string): Promise<MarkdownFileScanResultOpts> {
  if (pathInput.endsWith('.zip')) {
    try {
      const outputDir = (await dir({ prefix: 'rdme-migration-zip-contents' })).path;

      const unzipSpinner = ora({ ...oraOptions() }).start(
        `🤐 Unzipping contents of ${chalk.underline(pathInput)} to the following directory: ${chalk.underline(outputDir)}...`,
      );

      const directory = await Open.file(pathInput);
      await directory.extract({ path: outputDir });

      unzipSpinner.succeed(`${unzipSpinner.text} done!`);

      const newWorkingDir = path.join(outputDir, path.basename(pathInput, '.zip'));

      return { pathInput: newWorkingDir, zipped: true as const, unzippedDir: newWorkingDir };
    } catch (_e) {
      return { pathInput, zipped: false as const };
    }
  }
  return { pathInput, zipped: false as const };
}
