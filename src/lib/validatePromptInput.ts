import fs from 'fs';

/**
 * Removes any non-alphanumeric characters and replaces them with hyphens.
 *
 * This is used for file names and for YAML keys.
 */
export const cleanFileName = (input: string) => input.replace(/[^a-z0-9]/gi, '-');

/**
 * A validator function used in our prompts for when a user
 * is prompted to specify a file path.
 *
 * @param value the file name
 * @param getFullPath An optional function for adding a file path or any filename validations
 * @returns true if path is valid (i.e. is non-empty and doesn't already exist),
 * otherwise a string containing the error message
 */
export function validateFilePath(value: string, getFullPath: (file: string) => string = file => file) {
  if (value.length) {
    const fullPath = getFullPath(value);
    if (!fs.existsSync(fullPath)) {
      return true;
    }

    return 'Specified output path already exists.';
  }

  return 'An output path must be supplied.';
}

/**
 * Validates that a project subdomain value is valid.
 *
 * @param value the terminal input
 * @returns true if the subdomain value is valid, else an error message
 */
export function validateSubdomain(value: string) {
  return (
    /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/.test(value) || 'Project subdomain must contain only letters, numbers and dashes.'
  );
}
