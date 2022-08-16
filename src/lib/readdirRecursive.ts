import fs from 'fs';
import path from 'path';

/**
 * Recursively grabs all files within a given directory
 * (including subdirectories)
 * @param {String} folderToSearch path to directory
 * @param pathFilter a function that takes in a directory/file path
 * and returns a boolean. used for optimizing recursion paths
 * e.g. paths specified in a file like `.gitignore`
 * @link https://github.com/kaelzhang/node-ignore#createfilter
 * @returns {String[]} array of files
 */
export default function readdirRecursive(
  folderToSearch: string,
  pathFilter: (path: string) => boolean = () => true
): string[] {
  const filesInFolder = fs.readdirSync(folderToSearch, { withFileTypes: true }).filter(item => {
    // Some logic to construct pathname the way that `ignore` package consumes it
    // https://github.com/kaelzhang/node-ignore#2-filenames-and-dirnames
    let fullPathName = path.join(folderToSearch, item.name);
    if (item.isDirectory()) fullPathName = `${fullPathName}/`;

    return pathFilter(fullPathName);
  });
  const files = filesInFolder
    .filter(fileHandle => fileHandle.isFile())
    .map(fileHandle => path.join(folderToSearch, fileHandle.name));
  const folders = filesInFolder.filter(fileHandle => fileHandle.isDirectory());
  const subFiles = [].concat(
    ...folders.map(fileHandle => readdirRecursive(path.join(folderToSearch, fileHandle.name), pathFilter))
  );
  return [...files, ...subFiles];
}
