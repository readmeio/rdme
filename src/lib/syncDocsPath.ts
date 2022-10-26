import type { CommandCategories } from './baseCommand';

import fs from 'fs/promises';
import path from 'path';

import chalk from 'chalk';
import config from 'config';

import Command from './baseCommand';
import pushDoc from './pushDoc';
import readdirRecursive from './readdirRecursive';

/**
 * Takes a path (either to a directory of files or to a single file)
 * and syncs those (either via POST or PUT) to ReadMe.
 * @returns A promise-wrapped string with the results
 */
export default async function syncDocsPath(
  /** Project API key */
  key: string,
  /** ReadMe project version */
  selectedVersion: string,
  /** module within ReadMe to update (e.g. docs, changelogs, etc.) */
  cmdType: CommandCategories,
  /** Example command usage, used in error message */
  usage: string,
  /** Path input, can either be a directory or a single file */
  pathInput: string,
  /** boolean indicating dry run mode */
  dryRun: boolean,
  /** array of allowed file extensions */
  allowedFileExtensions = ['.markdown', '.md']
) {
  if (!pathInput) {
    return Promise.reject(new Error(`No path provided. Usage \`${config.get('cli')} ${usage}\`.`));
  }

  const stat = await fs.stat(pathInput).catch(err => {
    if (err.code === 'ENOENT') {
      throw new Error("Oops! We couldn't locate a file or directory at the path you provided.");
    }
    throw err;
  });

  let output: string;

  if (stat.isDirectory()) {
    // Filter out any files that don't match allowedFileExtensions
    const files = readdirRecursive(pathInput).filter(file =>
      allowedFileExtensions.includes(path.extname(file).toLowerCase())
    );

    Command.debug(`number of files: ${files.length}`);

    if (!files.length) {
      return Promise.reject(
        new Error(
          `The directory you provided (${pathInput}) doesn't contain any of the following required files: ${allowedFileExtensions.join(
            ', '
          )}.`
        )
      );
    }

    output = (
      await Promise.all(
        files.map(async filename => {
          return pushDoc(key, selectedVersion, dryRun, filename, cmdType);
        })
      )
    ).join('\n');
  } else {
    const fileExtension = path.extname(pathInput).toLowerCase();
    if (!allowedFileExtensions.includes(fileExtension)) {
      return Promise.reject(
        new Error(
          `Invalid file extension (${fileExtension}). Must be one of the following: ${allowedFileExtensions.join(', ')}`
        )
      );
    }
    output = await pushDoc(key, selectedVersion, dryRun, pathInput, cmdType);
  }
  return Promise.resolve(chalk.green(output));
}
