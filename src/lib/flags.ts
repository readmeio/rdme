import { Flags } from '@oclif/core';

/**
 * Used in any command where `github` is a `flag.
 */
export const githubFlag = Flags.boolean({ description: 'Create a new GitHub Actions workflow for this command.' });

/**
 * Used in any command where `key` is a `flag.
 */
export const keyFlag = Flags.string({ description: 'ReadMe Project API key', required: true });

/**
 * Used in the `openapi` family of commands where `title` is an option.
 */
export const titleFlag = Flags.string({
  description: 'An override value for the `info.title` field in the API definition',
});

/**
 * Used in any command where `version` is a flag.
 */
export const versionFlag = Flags.string({
  description:
    'Project version. If running command in a CI environment and this option is not passed, the main project version will be used.',
});

/**
 * Used in the `versions create` and `versions update` commands.
 */
export const baseVersionFlags = {
  codename: Flags.string({
    description: 'The codename, or nickname, for a particular version.',
  }),
  main: Flags.option({
    description: 'Should this be the main version for your project?',
    options: ['true', 'false'] as const,
  })(),
  beta: Flags.option({
    description: 'Should this version be in beta?',
    options: ['true', 'false'] as const,
  })(),
  deprecated: Flags.option({
    description: 'Should this version be deprecated? The main version cannot be deprecated.',
    options: ['true', 'false'] as const,
  })(),
  hidden: Flags.option({
    description: 'Should this version be hidden? The main version cannot be hidden.',
    options: ['true', 'false'] as const,
  })(),
} as const;

/**
 * Used in the `openapi` family of commands where `workingDirectory` is an option.
 */
export const workingDirectoryFlag = Flags.string({
  description: 'Working directory (for usage with relative external references)',
});
