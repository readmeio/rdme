import { Args, Flags } from '@oclif/core';

export const branchFlag = (additionalDescription: string[] = []) => ({
  branch: Flags.string({
    aliases: ['version'],
    default: 'stable',
    deprecateAliases: true,
    description: ['Defaults to `stable` (i.e., your main project version).'].concat(additionalDescription).join(' '),
    summary: 'ReadMe project version',
  }),
});

/**
 * Used in any command where `github` is a `flag.
 */
export const githubFlag = Flags.boolean({ description: 'Create a new GitHub Actions workflow for this command.' });

/**
 * Used in any command where `key` is a `flag.
 */
export const keyFlag = Flags.string({
  summary: 'ReadMe project API key',
  required: true,
  description:
    'An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v10#authentication',
});

/**
 * Used in the `openapi` family of commands where `title` is an option.
 */
export const titleFlag = Flags.string({
  description: 'An override value for the `info.title` field in the API definition',
});

/**
 * Used in the `openapi` family of commands where `workingDirectory` is an option.
 */
export const workingDirectoryFlag = Flags.string({
  description: 'Working directory (for usage with relative external references)',
});

export const specArg = Args.string({
  description:
    'A path to your API definition — either a local file path or a URL. If your working directory and all subdirectories contain a single OpenAPI file, you can omit the path.',
});
