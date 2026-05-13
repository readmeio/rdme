import oxlintConfig from '@readme/oxlint-config';
import oxlintConfigVitest from '@readme/oxlint-config/testing/vitest';
import oxlintConfigTS from '@readme/oxlint-config/typescript';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [oxlintConfig, oxlintConfigTS],
  options: {
    reportUnusedDisableDirectives: 'error',
  },
  ignorePatterns: ['coverage/', 'dist/', 'dist-gha/'],
  categories: {
    suspicious: 'error',
  },
  env: {
    browser: true,
    commonjs: true,
    es2022: true,
    node: true,
  },
  rules: {
    'max-classes-per-file': 'off',

    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['ci-info'],
            message:
              'The `ci-info` package is difficult to test because misleading results will appear when running tests in the GitHub Actions runner. Instead of importing this package directly, create a wrapper function in `lib/isCI.ts` and import that instead.',
          },
        ],
      },
    ],

    'oxc/no-this-in-exported-function': 'off',

    // We don't need to wrap `JSON.parse()` in a try/catch block because if JSON parsing anything
    // ever fails then we should fail.
    'readme/json-parse-try-catch': 'off',
  },
  overrides: [
    {
      files: ['test/**/*.test.{js,ts}'],
      ...oxlintConfigVitest,
      rules: Object.assign(structuredClone(oxlintConfigVitest.rules), {
        // We've had troubles in the past where our test coverage required us to use Vitest mocks
        // for `console.log()` calls, hurting our ability to write resilient tests and easily debug
        // issues.
        //
        // We should be returning Promise-wrapped values in our main command functions
        // so we can write robust tests and take advantage of `bin/run.js` and `src/baseCommand.ts`,
        // which we use for printing function outputs and returning correct exit codes.
        //
        // Furthermore, we should also be using our custom loggers (see `src/lib/logger.js`)
        // instead of using console.info() or console.warn() statements.
        'no-console': 'off',

        'vitest/require-mock-type-parameters': 'off',
        'vitest/warn-todo': 'off',
      }),
    },
  ],
});
