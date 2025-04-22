import type { MarkdownFileScanResultOpts } from '../types.js';

import path from 'node:path';

import chalk from 'chalk';
import ora from 'ora';
import { dir } from 'tmp-promise';
import { Open } from 'unzipper';

import { oraOptions } from './logger.js';

export async function unzip(pathInput: string): Promise<MarkdownFileScanResultOpts> {
  if (pathInput.endsWith('.zip')) {
    const outputDir = (await dir({ prefix: 'rdme-migration-zip-contents' })).path;

    const unzipSpinner = ora({ ...oraOptions() }).start(
      `🤐 Unzipping contents of ${chalk.underline(pathInput)} to the following directory: ${chalk.underline(outputDir)}...`,
    );

    const directory = await Open.file(pathInput);
    await directory.extract({ path: outputDir });

    unzipSpinner.succeed(`${unzipSpinner.text} done!`);

    const newWorkingDir = path.join(outputDir, path.basename(pathInput, '.zip'));

    return { pathInput: newWorkingDir, zipped: true as const, unzippedDir: newWorkingDir };
  }
  return { pathInput, zipped: false as const };
}
