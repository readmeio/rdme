// eslint-disable-next-line import/no-extraneous-dependencies
import { coverageConfigDefaults, configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, '**/dist-gha/**'],
    },
    // We'll defer to `@oclif/test` for console interception
    // so we can run assertions against console output.
    disableConsoleIntercept: true,
    env: {
      /**
       * The `chalk` and `colors` libraries have trouble with tests sometimes in test snapshots so
       * we're disabling colorization here for all tests.
       *
       * @see {@link https://github.com/chalk/supports-color/issues/106}
       */
      FORCE_COLOR: '0',
      /**
       * Sets our test `NODE_ENV` to a custom value in case of false positives if someone is using this
       * tool in a testing environment.
       */
      NODE_ENV: 'rdme-test',
    },
    exclude: [
      '**/__fixtures__/**',
      '**/dist-gha/**',
      '**/helpers/**',
      '**/__snapshots__/**',
      ...configDefaults.exclude,
    ],
    globalSetup: '__tests__/helpers/global-setup.ts',
    watchTriggerPatterns: [
      {
        pattern: /__tests__\/__fixtures__\/([A-z,-]+)\/([A-z,-/.]+)/g,
        testsToRun: (_file, match) => {
          const fixtureDirectory = match[1];
          if (['docs', 'reference', 'changelog'].includes(fixtureDirectory)) {
            if (fixtureDirectory === 'changelog') {
              return '__tests__/commands/changelog/upload.test.ts';
            }
            return '__tests__/commands/page/upload.test.ts';
          }

          return null;
        },
      },
      {
        pattern: /__tests__\/__fixtures__\/([A-z,-]+)\/(.*).json/g,
        testsToRun: (_file, match) => {
          const fixtureDirectory = match[1];
          if (fixtureDirectory === 'circular-ref-oas') {
            return '__tests__/commands/openapi/resolve.test.ts';
          }

          return null;
        },
      },
    ],
  },
});
