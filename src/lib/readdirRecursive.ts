import type { Ignore } from 'ignore';

import fs from 'fs';
import path from 'path';

import ignore from 'ignore';

import { debug } from './logger';

/**
 * Recursively grabs all files within a given directory
 * (including subdirectories)
 * @param folderToSearch path to directory
 * @param ignoreGit boolean to indicate whether or not to ignore
 * `.git` directory plus any files specified in `.gitignore`
 * @returns array of file names
 */
export default function readdirRecursive(folderToSearch: string, ignoreGit = false): string[] {
  debug(`current readdirRecursive folder: ${folderToSearch}`);

  let ignoreFilter: Ignore;
  if (ignoreGit) {
    // Initialize ignore filter with `.git` directory
    ignoreFilter = ignore().add(path.join(folderToSearch, '.git/'));
    // If .gitignore file exists, load its contents into ignore filter
    if (fs.existsSync(path.join(folderToSearch, '.gitignore'))) {
      debug('.gitignore file found, adding to ignore filter');
      ignoreFilter.add(fs.readFileSync(path.join(folderToSearch, '.gitignore')).toString());
    }
  }

  const filesInFolder = fs.readdirSync(folderToSearch, { withFileTypes: true }).filter(item => {
    if (!ignoreGit) return true;
    // Some logic to construct pathname the way that `ignore` package consumes it
    // https://github.com/kaelzhang/node-ignore#2-filenames-and-dirnames
    let fullPathName = path.join(folderToSearch, item.name);
    if (item.isDirectory()) fullPathName = `${fullPathName}/`;

    return !ignoreFilter.ignores(fullPathName);
  });

  const files = filesInFolder
    .filter(fileHandle => fileHandle.isFile())
    .map(fileHandle => path.join(folderToSearch, fileHandle.name));

  const folders = filesInFolder.filter(fileHandle => fileHandle.isDirectory());

  const subFiles = [].concat(
    ...folders.map(fileHandle => readdirRecursive(path.join(folderToSearch, fileHandle.name), ignoreGit)),
  );

  return [...files, ...subFiles];
}
