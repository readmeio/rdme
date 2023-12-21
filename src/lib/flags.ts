import { Flags } from '@oclif/core';

/**
 * Used in any command where `github` is a `flag.
 */
export const github = Flags.boolean({ description: 'Create a new GitHub Actions workflow for this command.' });

/**
 * Used in any command where `key` is a `flag.
 */
export const key = Flags.string({ description: 'Project API key' });

/**
 * Used in the `openapi` family of commands where `title` is an option.
 */
export const title = Flags.string({
  description: 'An override value for the `info.title` field in the API definition',
});

/**
 * Used in any command where `version` is a flag.
 */
export const version = Flags.string({
  description:
    'Project version. If running command in a CI environment and this option is not passed, the main project version will be used.',
});

/**
 * Used in the `versions:create` and `versions:update` commands.
 */
export const versionOpts = {
  codename: Flags.string({
    description: 'The codename, or nickname, for a particular version.',
  }),
  main: Flags.string({
    description: "Should this be the main version for your project? (Must be 'true' or 'false')",
  }),
  beta: Flags.string({
    description: "Should this version be in beta? (Must be 'true' or 'false')",
  }),
  deprecated: Flags.string({
    description:
      "Should) this version be deprecated? The main version cannot be deprecated. (Must be 'true' or 'false')",
  }),
  hidden: Flags.string({
    description: "Should this version be hidden? The main version cannot be hidden. (Must be 'true' or 'false')",
  }),
};

/**
 * Used in the `openapi` family of commands where `workingDirectory` is an option.
 */
export const workingDirectory = Flags.string({
  description: 'Working directory (for usage with relative external references)',
});
