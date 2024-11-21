// eslint-disable-next-line import/no-extraneous-dependencies
import { coverageConfigDefaults, configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, '**/dist-gha/**'],
    },
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
    onConsoleLog(log: string, type: 'stderr' | 'stdout'): boolean | void {
      // hides `rdme open` deprecation warning
      return !(log.includes('`rdme open` is deprecated and will be removed in a future release') && type === 'stderr');
    },
    setupFiles: ['./__tests__/helpers/vitest.matchers.ts'],
  },
});
